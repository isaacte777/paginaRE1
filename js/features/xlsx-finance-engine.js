// XLSX FINANCE ENGINE: Analizador estructural profundo de libros Excel (.xlsx / .csv)
// y constructor reactivo de Árboles de Nodos Financieros para FlowLab (Finanzas + Chat IA).

(function () {
  const REPO_SAMPLE_XLSX_NAME = 'Sistema financiero Familiar Gere y Milki (1).xlsx';
  const REPO_SAMPLE_XLSX_URL = encodeURI('./' + REPO_SAMPLE_XLSX_NAME);

  let activeFinancialWorkbook = null;
  let activeWorkbookViewKey = 'master'; // 'master' | 'sheet:<idx>'

  function decodeXmlText(str) {
    return String(str || '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }

  function normPlain(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function colLettersToIndex(letters) {
    let n = 0;
    const up = String(letters || '').toUpperCase();
    for (let i = 0; i < up.length; i++) {
      const code = up.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        n = n * 26 + (code - 64);
      }
    }
    return Math.max(0, n - 1);
  }

  function colIndexToLetters(index) {
    let n = Math.max(0, Number(index) || 0) + 1;
    let out = '';
    while (n > 0) {
      const rem = (n - 1) % 26;
      out = String.fromCharCode(65 + rem) + out;
      n = Math.floor((n - 1) / 26);
    }
    return out || 'A';
  }

  function makeSheetCellRef(index) {
    const col = colIndexToLetters(Math.floor(index / 25));
    const row = (index % 25) + 1;
    return `${col}${row}`;
  }

  function parseCleanNumber(val) {
    if (typeof val === 'number') return Number.isFinite(val) ? val : NaN;
    const raw = String(val ?? '').trim();
    if (!raw || raw === '-' || raw === '--' || raw.startsWith('#')) return NaN;
    // Soportar notación científica de Excel como "2.4E7"
    if (/^[+-]?\d+(?:\.\d+)?e[+-]?\d+$/i.test(raw)) {
      const sci = Number(raw);
      return Number.isFinite(sci) ? sci : NaN;
    }
    let cleaned = raw.replace(/[₲$€R\s]/gi, '').replace(/^Gs\.?\s*/i, '');
    if (/^-?[\d.]+,\d{1,4}$/.test(cleaned)) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (/^-?[\d,]+(?:\.\d+)?$/.test(cleaned)) {
      cleaned = cleaned.replace(/,/g, '');
    } else {
      return NaN;
    }
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function formatMoneyCompact(amount, currency = 'PYG') {
    const n = Number(amount) || 0;
    if (currency === 'PYG') {
      return '₲ ' + Math.round(n).toLocaleString('es-PY');
    }
    const sym = currency === 'EUR' ? '€' : currency === 'BRL' ? 'R$ ' : '$';
    return sym + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // =========================================================================
  // 1. DESCOMPRESIÓN NATIVA ZIP / OOXML (.xlsx) EN NAVEGADOR Y NODE
  // =========================================================================
  async function inflateRawBytes(compressedBytes) {
    if (typeof DecompressionStream === 'undefined') return null;
    try {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(compressedBytes);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.byteLength;
      }
      const out = new Uint8Array(total);
      let offset = 0;
      for (const ch of chunks) {
        out.set(ch, offset);
        offset += ch.byteLength;
      }
      return out;
    } catch {
      return null;
    }
  }

  async function extractZipTextMap(arrayBuffer, filterFn) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const out = new Map();
    const decoder = new TextDecoder('utf-8', { fatal: false });

    let eocdPos = -1;
    const minPos = Math.max(0, bytes.length - 65557);
    for (let i = bytes.length - 22; i >= minPos; i--) {
      if (view.getUint32(i, true) === 0x06054b50) {
        eocdPos = i;
        break;
      }
    }
    if (eocdPos < 0) return out;

    const totalEntries = view.getUint16(eocdPos + 10, true);
    const cdOffset = view.getUint32(eocdPos + 16, true);
    let ptr = cdOffset;

    for (let e = 0; e < totalEntries && ptr + 46 <= bytes.length; e++) {
      if (view.getUint32(ptr, true) !== 0x02014b50) break;
      const compression = view.getUint16(ptr + 10, true);
      const compSize = view.getUint32(ptr + 20, true);
      const nameLen = view.getUint16(ptr + 28, true);
      const extraLen = view.getUint16(ptr + 30, true);
      const commentLen = view.getUint16(ptr + 32, true);
      const localHeaderOffset = view.getUint32(ptr + 42, true);
      const entryName = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
      ptr += 46 + nameLen + extraLen + commentLen;

      if (filterFn && !filterFn(entryName)) continue;
      if (localHeaderOffset + 30 > bytes.length) continue;
      if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) continue;

      const lNameLen = view.getUint16(localHeaderOffset + 26, true);
      const lExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
      if (dataStart + compSize > bytes.length) continue;

      const slice = bytes.subarray(dataStart, dataStart + compSize);
      let rawBytes = null;
      if (compression === 0) {
        rawBytes = slice;
      } else if (compression === 8) {
        rawBytes = await inflateRawBytes(slice);
      }
      if (rawBytes) {
        out.set(entryName, decoder.decode(rawBytes));
      }
    }
    return out;
  }

  // =========================================================================
  // 2. EXTRACTOR COMPLETO DE LIBRO EXCEL (.XLSX) CON NOMBRES REALES DE HOJAS
  // =========================================================================
  async function parseWorkbookFromBuffer(arrayBuffer, fileName = 'planilla.xlsx') {
    const entries = await extractZipTextMap(
      arrayBuffer,
      name =>
        name === 'xl/sharedStrings.xml' ||
        name === 'xl/workbook.xml' ||
        name === 'xl/_rels/workbook.xml.rels' ||
        /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)
    );

    // 1. SharedStrings
    const sharedStrings = [];
    const ssXml = entries.get('xl/sharedStrings.xml') || '';
    if (ssXml) {
      const siRe = /<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/gi;
      let sm;
      while ((sm = siRe.exec(ssXml)) !== null) {
        const siBody = sm[1] || '';
        const tRe = /<t(?:\s[^>]*)?(?:\/>|>([\s\S]*?)<\/t>)/gi;
        let tm;
        let parts = '';
        while ((tm = tRe.exec(siBody)) !== null) {
          parts += decodeXmlText(tm[1] || '');
        }
        sharedStrings.push(parts);
      }
    }

    // 2. Relación de hojas reales en orden de pestaña
    const relMap = new Map();
    const relsXml = entries.get('xl/_rels/workbook.xml.rels') || '';
    if (relsXml) {
      const relRe = /<Relationship\b([^>]*)\/?>/gi;
      let rm;
      while ((rm = relRe.exec(relsXml)) !== null) {
        const attrs = rm[1] || '';
        const idM = attrs.match(/\bId="([^"]+)"/i);
        const targetM = attrs.match(/\bTarget="([^"]+)"/i);
        if (idM && targetM) {
          let target = targetM[1].replace(/^\/+/, '');
          if (!target.startsWith('xl/')) target = 'xl/' + target;
          relMap.set(idM[1], target);
        }
      }
    }

    const sheetDefs = [];
    const wbXml = entries.get('xl/workbook.xml') || '';
    if (wbXml) {
      const shRe = /<sheet\b([^>]*)\/?>/gi;
      let sm;
      while ((sm = shRe.exec(wbXml)) !== null) {
        const attrs = sm[1] || '';
        const nameM = attrs.match(/\bname="([^"]+)"/i);
        const ridM = attrs.match(/\br:id="([^"]+)"/i);
        const stateM = attrs.match(/\bstate="([^"]+)"/i);
        if (nameM) {
          const sheetPath = (ridM && relMap.get(ridM[1])) || `xl/worksheets/sheet${sheetDefs.length + 1}.xml`;
          sheetDefs.push({
            name: decodeXmlText(nameM[1]).trim(),
            path: sheetPath,
            hidden: Boolean(stateM && stateM[1] !== 'visible')
          });
        }
      }
    }

    if (sheetDefs.length === 0) {
      Array.from(entries.keys())
        .filter(k => /^xl\/worksheets\/sheet\d+\.xml$/i.test(k))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .forEach((p, idx) => {
          sheetDefs.push({ name: `Hoja ${idx + 1}`, path: p, hidden: false });
        });
    }

    const allNumbersSample = [];
    const allTextSample = [];
    const rawSheets = [];

    sheetDefs.forEach((def, sheetIndex) => {
      if (def.hidden) return;
      const xml = entries.get(def.path);
      if (!xml) return;

      const grid = new Map(); // rowNumber -> Map(colIdx -> cellObj)
      let maxRow = 0;
      let maxCol = 0;
      let formulaCount = 0;
      const structuredRows = [];

      const rowRe = /<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/gi;
      let rm;
      while ((rm = rowRe.exec(xml)) !== null) {
        const rAttr = rm[1] || '';
        const rowBody = rm[2] || '';
        if (!rowBody) continue;
        const rNumM = rAttr.match(/\br="(\d+)"/i);
        const rowNum = rNumM ? Number(rNumM[1]) : maxRow + 1;

        const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/gi;
        let cm;
        let colCursor = 0;
        const rowMap = new Map();
        const rowList = [];

        while ((cm = cellRe.exec(rowBody)) !== null) {
          const attrs = cm[1] || '';
          const inner = cm[2] || '';
          if (!inner) {
            const emptyRefM = attrs.match(/\br="([A-Z]+)(\d+)"/i);
            colCursor = emptyRefM ? colLettersToIndex(emptyRefM[1].toUpperCase()) + 1 : colCursor + 1;
            continue;
          }
          const refM = attrs.match(/\br="([A-Z]+)(\d+)"/i);
          const colLetters = refM ? refM[1].toUpperCase() : colIndexToLetters(colCursor);
          const colIdx = refM ? colLettersToIndex(colLetters) : colCursor;
          colCursor = colIdx + 1;

          const typeM = attrs.match(/\bt="([^"]+)"/i);
          const cellType = typeM ? typeM[1] : '';
          const fMatch = inner.match(/<f(?:\s[^>]*)?(?:\/>|>([\s\S]*?)<\/f>)/i);
          const vMatch = inner.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/i);
          const inlineMatches = [...inner.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/gi)];

          let rawFormula = fMatch && fMatch[1] ? decodeXmlText(fMatch[1]).trim() : '';
          // Ignorar funciones SPARKLINE decorativas de Google Sheets exportadas a Excel
          if (/DUMMYFUNCTION|SPARKLINE/i.test(rawFormula)) {
            rawFormula = '';
          }

          let rawVal = vMatch ? decodeXmlText(vMatch[1]).trim() : '';
          if (cellType === 's' && rawVal !== '') {
            rawVal = sharedStrings[Number(rawVal)] ?? rawVal;
          } else if ((cellType === 'inlineStr' || !rawVal) && inlineMatches.length > 0) {
            rawVal = inlineMatches.map(m => decodeXmlText(m[1])).join('');
          }

          const trimmedVal = String(rawVal || '').replace(/\s+/g, ' ').trim();
          const hasRefErr = /^#(REF|DIV\/0|VALUE|NAME\?|N\/A)/i.test(trimmedVal);
          const numVal = cellType === 's' || cellType === 'str' || cellType === 'inlineStr'
            ? parseCleanNumber(trimmedVal)
            : parseCleanNumber(trimmedVal);

          if (!trimmedVal && !rawFormula) continue;

          if (rawFormula) formulaCount++;
          if (Number.isFinite(numVal) && Math.abs(numVal) > 0 && Math.abs(numVal) !== 2026 && Math.abs(numVal) !== 2027) {
            allNumbersSample.push(Math.abs(numVal));
          } else if (trimmedVal && trimmedVal.length <= 80) {
            allTextSample.push(trimmedVal);
          }

          const cellObj = {
            ref: `${colLetters}${rowNum}`,
            row: rowNum,
            col: colIdx,
            colLetters,
            text: trimmedVal,
            num: Number.isFinite(numVal) ? numVal : null,
            formula: rawFormula ? '=' + rawFormula : '',
            hasError: hasRefErr
          };
          rowMap.set(colIdx, cellObj);
          rowList.push({ ref: cellObj.ref, value: trimmedVal, formula: cellObj.formula });
          if (colIdx > maxCol) maxCol = colIdx;
        }

        if (rowMap.size > 0) {
          grid.set(rowNum, rowMap);
          structuredRows.push(rowList);
          if (rowNum > maxRow) maxRow = rowNum;
        }
      }

      rawSheets.push({
        index: sheetIndex,
        name: def.name,
        grid,
        maxRow,
        maxCol,
        nonEmptyRowCount: grid.size,
        formulaCount,
        structuredRows
      });
    });

    const currency = detectWorkbookCurrency(fileName, allTextSample, allNumbersSample);
    const analyzedSheets = rawSheets.map(sh => analyzeSheetSemantically(sh, currency));

    return {
      fileName,
      title: fileName.replace(/\.[^.]+$/, '').trim() || 'Sistema Financiero',
      currency,
      sheetCount: analyzedSheets.length,
      sheets: analyzedSheets,
      totalFormulas: analyzedSheets.reduce((acc, s) => acc + s.formulaCount, 0),
      totalNonEmptyRows: analyzedSheets.reduce((acc, s) => acc + s.nonEmptyRowCount, 0)
    };
  }

  function parseCsvAsWorkbook(csvText, fileName = 'datos.csv') {
    const lines = String(csvText || '')
      .split(/\r?\n/)
      .filter(l => l.trim().length > 0);
    const sep = lines[0] && lines[0].includes(';') && !lines[0].includes(',') ? ';' : lines[0] && lines[0].includes('\t') ? '\t' : ',';
    const grid = new Map();
    const allNumbersSample = [];
    const allTextSample = [];
    const structuredRows = [];
    let maxCol = 0;

    lines.forEach((line, idx) => {
      const rowNum = idx + 1;
      const cols = line.split(sep).map(s => s.replace(/^"|"$/g, '').trim());
      const rowMap = new Map();
      const rowList = [];
      cols.forEach((txt, cIdx) => {
        if (!txt) return;
        const num = parseCleanNumber(txt);
        const ref = `${colIndexToLetters(cIdx)}${rowNum}`;
        if (Number.isFinite(num) && num !== 0) allNumbersSample.push(Math.abs(num));
        else allTextSample.push(txt);
        const cellObj = {
          ref,
          row: rowNum,
          col: cIdx,
          colLetters: colIndexToLetters(cIdx),
          text: txt,
          num: Number.isFinite(num) ? num : null,
          formula: txt.startsWith('=') ? txt : '',
          hasError: false
        };
        rowMap.set(cIdx, cellObj);
        rowList.push({ ref, value: txt, formula: cellObj.formula });
        if (cIdx > maxCol) maxCol = cIdx;
      });
      if (rowMap.size > 0) {
        grid.set(rowNum, rowMap);
        structuredRows.push(rowList);
      }
    });

    const currency = detectWorkbookCurrency(fileName, allTextSample, allNumbersSample);
    const sheet = analyzeSheetSemantically(
      {
        index: 0,
        name: fileName.replace(/\.[^.]+$/, '').slice(0, 28) || 'Planilla CSV',
        grid,
        maxRow: lines.length,
        maxCol,
        nonEmptyRowCount: grid.size,
        formulaCount: 0,
        structuredRows
      },
      currency
    );

    return {
      fileName,
      title: fileName.replace(/\.[^.]+$/, '').trim() || 'Planilla CSV',
      currency,
      sheetCount: 1,
      sheets: [sheet],
      totalFormulas: 0,
      totalNonEmptyRows: grid.size
    };
  }

  function detectWorkbookCurrency(fileName, texts, numbers) {
    const joined = `${fileName} ${texts.slice(0, 240).join(' ')}`;
    if (/₲|\bPYG\b|\bGs\.?\b|\bguarani|\bueno\b|\bbiggie\b|\btigo\b|\bcontinental\b|\bcontinetal\b/i.test(joined)) {
      return 'PYG';
    }
    if (/R\$|\bBRL\b/i.test(joined)) return 'BRL';
    if (/€|\bEUR\b/i.test(joined)) return 'EUR';
    if (/\bARS\b/i.test(joined)) return 'ARS';

    const valid = numbers.filter(n => n >= 100 && n < 1e11).sort((a, b) => a - b);
    if (valid.length >= 8) {
      const median = valid[Math.floor(valid.length * 0.5)];
      const intRatio = valid.filter(n => Math.abs(n - Math.round(n)) < 0.001).length / valid.length;
      if (median >= 45000 && intRatio >= 0.8) {
        return 'PYG';
      }
    }
    return 'USD';
  }

  // =========================================================================
  // 3. CLASIFICADOR SEMÁNTICO UNIVERSAL DE HOJAS FINANCIERAS
  // =========================================================================
  function getCell(grid, row, col) {
    const r = grid.get(row);
    return r ? r.get(col) || null : null;
  }

  function findNextNumberRight(grid, row, startCol, maxDistance = 4) {
    const r = grid.get(row);
    if (!r) return null;
    for (let c = startCol + 1; c <= startCol + maxDistance; c++) {
      const cell = r.get(c);
      if (cell && cell.num !== null) return cell.num;
    }
    return null;
  }

  function analyzeSheetSemantically(rawSheet, currency) {
    const { grid, name } = rawSheet;
    const sheetNorm = normPlain(name);

    // Recopilar todos los textos con sus coordenadas para detectar el arquetipo
    const allCells = [];
    for (const [rNum, rowMap] of grid.entries()) {
      for (const [cIdx, cell] of rowMap.entries()) {
        allCells.push(cell);
      }
    }

    const hasGastosLabel = allCells.some(c => /^(gastos?|egresos?|costos?)$/i.test(c.text));
    const hasGananciasLabel = allCells.some(c => /^(ganancias?|ingresos?|entradas?|ventas?)$/i.test(c.text));
    const hasPrevistoReal =
      allCells.some(c => /^(previsto|presupuesto|proyecci[oó]n)$/i.test(c.text)) &&
      allCells.some(c => /^(real|ejecutado)$/i.test(c.text));

    if ((hasGastosLabel && hasGananciasLabel) || (hasPrevistoReal && (hasGastosLabel || hasGananciasLabel || /resumen|mes|presupuesto/i.test(sheetNorm)))) {
      return extractMonthlyBudgetSheet(rawSheet, currency);
    }

    const consumoCount = allCells.filter(c => /^consumo$/i.test(c.text)).length;
    if (/tarjeta/i.test(sheetNorm) || consumoCount >= 2) {
      return extractCreditCardsSheet(rawSheet, currency);
    }

    const hasScheduleCols =
      allCells.some(c => /^mes$/i.test(c.text)) &&
      allCells.some(c => /^estado$/i.test(c.text));
    if (/fecha.*pago|calendario|vencimiento|cronograma/i.test(sheetNorm) || hasScheduleCols) {
      return extractPaymentScheduleSheet(rawSheet, currency);
    }

    const hasDebtMarkers =
      allCells.some(c => /^cuota\s*\d+/i.test(c.text)) ||
      allCells.some(c => /^total\s+pagado$/i.test(c.text)) ||
      allCells.some(c => /^falta\s+pagar$/i.test(c.text));
    if (/deuda|prestamo|herramienta|credito|financiamiento/i.test(sheetNorm) || hasDebtMarkers) {
      return extractDebtOrAssetBlocksSheet(rawSheet, currency);
    }

    return extractGenericFinancialTableSheet(rawSheet, currency);
  }

  // --- Arquetipo A: Hoja Mensual Presupuesto (Gastos + Ganancias + Deudas/Clientes + KPIs) ---
  function extractMonthlyBudgetSheet(rawSheet, currency) {
    const { grid, name, maxRow } = rawSheet;

    let capitalInicial = null;
    let capitalFinal = null;
    let capitalTotalMasEfectivo = null;
    let efectivoDisponible = 0;
    let efectivoUsado = 0;
    let ahorroCambio = null;

    // Escanear bloque superior de KPIs (filas 1..18)
    for (let r = 1; r <= Math.min(18, maxRow); r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      for (const [cIdx, cell] of rowMap.entries()) {
        const tn = normPlain(cell.text);
        if (/^(capital|saldo)\s+inicial:?$/.test(tn)) {
          const vRight = findNextNumberRight(grid, r, cIdx, 3);
          const vBelow = getCell(grid, r + 1, cIdx)?.num;
          if (vRight !== null && capitalInicial === null) capitalInicial = vRight;
          else if (vBelow !== null && vBelow !== undefined && capitalInicial === null) capitalInicial = vBelow;
        } else if (/^(capital|saldo)\s+final:?$/.test(tn)) {
          const vRight = findNextNumberRight(grid, r, cIdx, 3);
          const vBelow = getCell(grid, r + 1, cIdx)?.num;
          if (vRight !== null && capitalFinal === null) {
            capitalFinal = vRight;
            // Verificar si hay columna contigua BANCO + EFECTIVO
            for (let k = cIdx + 2; k <= cIdx + 4; k++) {
              const extra = getCell(grid, r, k)?.num;
              if (extra !== null && extra !== undefined && extra > vRight) {
                capitalTotalMasEfectivo = extra;
                break;
              }
            }
          } else if (vBelow !== null && vBelow !== undefined && capitalFinal === null) {
            capitalFinal = vBelow;
          }
        } else if (/^efectivo:?$/.test(tn)) {
          const v = findNextNumberRight(grid, r, cIdx, 2);
          if (v !== null) efectivoDisponible = v;
        } else if (/^usados?:?$/.test(tn)) {
          const v = findNextNumberRight(grid, r, cIdx, 2);
          if (v !== null) efectivoUsado = v;
        }
      }
    }

    // Localizar fila de cabeceras de tablas ("Previsto" / "Real" / "Proyeccion")
    let headerRow = 19;
    const previstoCols = [];
    const realCols = [];
    for (let r = 15; r <= Math.min(26, maxRow); r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      const pCols = [];
      const rCols = [];
      for (const [cIdx, cell] of rowMap.entries()) {
        const tn = normPlain(cell.text);
        if (/^(previsto|presupuesto|proyeccion)$/.test(tn)) pCols.push(cIdx);
        else if (/^(real|ejecutado)$/.test(tn)) rCols.push(cIdx);
      }
      if (pCols.length >= 1 && rCols.length >= 1 && r >= 18) {
        headerRow = r;
        previstoCols.push(...pCols);
        realCols.push(...rCols);
        break;
      }
    }

    const expPlanCol = previstoCols[0] ?? 3;
    const expRealCol = realCols.find(c => c > expPlanCol) ?? expPlanCol + 1;
    // Columna de etiquetas de Gastos: buscar "Totales" o "Gastos" a la izquierda de expPlanCol
    let expLabelCol = Math.max(0, expPlanCol - 2);
    for (let r = headerRow - 2; r <= headerRow + 2; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      for (const [cIdx, cell] of rowMap.entries()) {
        if (cIdx < expPlanCol && /^(gastos?|totales)$/i.test(cell.text)) {
          expLabelCol = cIdx;
        }
      }
    }

    const incPlanCol = previstoCols.find(c => c > expRealCol + 1) ?? expRealCol + 5;
    const incRealCol = realCols.find(c => c > incPlanCol) ?? incPlanCol + 1;
    let incLabelCol = Math.max(expRealCol + 2, incPlanCol - 2);
    for (let r = headerRow - 2; r <= headerRow + 2; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      for (const [cIdx, cell] of rowMap.entries()) {
        if (cIdx > expRealCol && cIdx < incPlanCol && /^(ganancias?|ingresos?|totales)$/i.test(cell.text)) {
          incLabelCol = cIdx;
        }
      }
    }

    // Detectar 3ra tabla opcional a la derecha (Pago de Deudas / Clientes / Cancelación)
    let sideLabelCol = null;
    let sideAmountCol = null;
    let sidePaidCol = null;
    for (let r = headerRow - 2; r <= headerRow + 2; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      for (const [cIdx, cell] of rowMap.entries()) {
        if (cIdx > incRealCol + 2 && /pago\s+de\s+deudas|cancelacion|clientes/i.test(normPlain(cell.text))) {
          sideLabelCol = cIdx;
          sideAmountCol = cIdx + 2;
          sidePaidCol = cIdx + 3;
          break;
        }
      }
      if (sideLabelCol !== null) break;
    }

    // Leer fila Totales (usualmente headerRow + 1)
    const totalsRow = headerRow + 1;
    let gastosPrevisto = getCell(grid, totalsRow, expPlanCol)?.num ?? 0;
    let gastosReal = getCell(grid, totalsRow, expRealCol)?.num ?? 0;
    let gananciasPrevisto = getCell(grid, totalsRow, incPlanCol)?.num ?? 0;
    let gananciasReal = getCell(grid, totalsRow, incRealCol)?.num ?? 0;

    // Recorrer filas de ítems de Gastos, Ganancias y Tabla lateral
    const expenseCategories = new Map();
    let currentExpCat = 'Gastos Generales';
    const expenseItems = [];

    const incomeGroups = new Map();
    let currentIncGroup = 'Ingresos Principales';
    const incomeItems = [];

    const receivableItems = [];
    let receivablesTotal = 0;
    let receivablesPaid = 0;

    for (let r = totalsRow + 1; r <= maxRow; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;

      // 1) Tabla Gastos
      const expLblRaw = getCell(grid, r, expLabelCol)?.text || '';
      const expPlan = getCell(grid, r, expPlanCol)?.num ?? 0;
      const expReal = getCell(grid, r, expRealCol)?.num ?? 0;
      const cleanExpLbl = expLblRaw.replace(/^[.,\-_\s]+|[.,\-_\s]+$/g, '').trim();

      if (cleanExpLbl && cleanExpLbl.toUpperCase() !== 'X' && cleanExpLbl.length >= 2) {
        const hasNextRows = Boolean(getCell(grid, r + 1, expLabelCol)?.text);
        const isSectionHeader =
          expPlan === 0 &&
          expReal === 0 &&
          hasNextRows &&
          /^(gastos?\s+fijos?|deudas?|caja\s+chica|gastos?\s+indirectos?|gastos?\s+boda|extraccion|extracion|gastos?\s+barios|fugas?)$/i.test(
            normPlain(cleanExpLbl)
          );

        if (isSectionHeader) {
          currentExpCat = cleanExpLbl;
        } else if (expPlan > 0 || expReal > 0) {
          const item = {
            category: currentExpCat,
            label: cleanExpLbl,
            planned: expPlan,
            actual: expReal,
            row: r
          };
          expenseItems.push(item);
          if (!expenseCategories.has(currentExpCat)) {
            expenseCategories.set(currentExpCat, { name: currentExpCat, planned: 0, actual: 0, items: [] });
          }
          const bucket = expenseCategories.get(currentExpCat);
          bucket.planned += expPlan;
          bucket.actual += expReal;
          bucket.items.push(item);
        }
      } else if (!cleanExpLbl && expReal > 0) {
        // Gasto sin nombre explícito ("X" o celda rápida)
        const fallbackCat = currentExpCat || 'Otros Gastos';
        if (!expenseCategories.has(fallbackCat)) {
          expenseCategories.set(fallbackCat, { name: fallbackCat, planned: 0, actual: 0, items: [] });
        }
        const bucket = expenseCategories.get(fallbackCat);
        bucket.actual += expReal;
        bucket.items.push({ category: fallbackCat, label: `Gasto fila ${r}`, planned: expPlan, actual: expReal, row: r });
      }

      // 2) Tabla Ganancias / Ingresos
      const incLblRaw = getCell(grid, r, incLabelCol)?.text || '';
      const incPlan = getCell(grid, r, incPlanCol)?.num ?? 0;
      const incReal = getCell(grid, r, incRealCol)?.num ?? 0;
      const cleanIncLbl = incLblRaw.replace(/^[.,\-_\s]+|[.,\-_\s]+$/g, '').trim();

      if (cleanIncLbl && cleanIncLbl.length >= 2) {
        const isIncHeader =
          incPlan === 0 &&
          incReal === 0 &&
          /^(milki|gere|extras?|regalo\s+de\s+boda|ingresos?\s+fijos?|comisiones?)$/i.test(normPlain(cleanIncLbl));
        if (isIncHeader) {
          currentIncGroup = cleanIncLbl;
        } else if (incPlan > 0 || incReal > 0) {
          const item = {
            group: currentIncGroup,
            label: cleanIncLbl,
            planned: incPlan,
            actual: incReal,
            row: r
          };
          incomeItems.push(item);
          if (!incomeGroups.has(currentIncGroup)) {
            incomeGroups.set(currentIncGroup, { name: currentIncGroup, planned: 0, actual: 0, items: [] });
          }
          const bucket = incomeGroups.get(currentIncGroup);
          bucket.planned += incPlan;
          bucket.actual += incReal;
          bucket.items.push(item);
        }
      }

      // 3) Tabla lateral Cuentas por Cobrar / Pago de Deudas
      if (sideLabelCol !== null) {
        const sideLbl = (getCell(grid, r, sideLabelCol)?.text || '').trim();
        const sideAmt = getCell(grid, r, sideAmountCol)?.num ?? 0;
        const sidePaid = getCell(grid, r, sidePaidCol)?.num ?? 0;
        if (sideLbl && /^total\s*=?\s*$/i.test(sideLbl)) {
          if (sideAmt > 0) receivablesTotal = sideAmt;
          if (sidePaid > 0) receivablesPaid = sidePaid;
        } else if (sideLbl && !/^clientes$/i.test(sideLbl) && (sideAmt > 0 || sidePaid > 0)) {
          receivableItems.push({
            label: sideLbl,
            amount: sideAmt,
            paid: sidePaid,
            pending: Math.max(0, sideAmt - sidePaid)
          });
        }
      }
    }

    const sumExpReal = expenseItems.reduce((s, i) => s + i.actual, 0);
    const sumExpPlan = expenseItems.reduce((s, i) => s + i.planned, 0);
    const sumIncReal = incomeItems.reduce((s, i) => s + i.actual, 0);
    const sumIncPlan = incomeItems.reduce((s, i) => s + i.planned, 0);

    if (!gastosReal && sumExpReal > 0) gastosReal = sumExpReal;
    if (!gastosPrevisto && sumExpPlan > 0) gastosPrevisto = sumExpPlan;
    if (!gananciasReal && sumIncReal > 0) gananciasReal = sumIncReal;
    if (!gananciasPrevisto && sumIncPlan > 0) gananciasPrevisto = sumIncPlan;

    if (capitalInicial === null) capitalInicial = 0;
    if (capitalFinal === null) capitalFinal = capitalInicial + (gananciasReal - gastosReal);
    ahorroCambio = capitalFinal - capitalInicial;

    if (!receivablesTotal && receivableItems.length > 0) {
      receivablesTotal = receivableItems.reduce((s, i) => s + i.amount, 0);
      receivablesPaid = receivableItems.reduce((s, i) => s + i.paid, 0);
    }

    // Etiqueta corta de mes (ej. "Octubre 2026")
    const shortMonthMatch = name.match(/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+\d{4})?/i);
    const shortLabel = shortMonthMatch
      ? shortMonthMatch[0].replace(/^\w/, c => c.toUpperCase())
      : name;

    return {
      ...rawSheet,
      archetype: 'monthly_budget',
      shortLabel,
      currency,
      kpis: {
        capitalInicial,
        capitalFinal,
        capitalTotalMasEfectivo: capitalTotalMasEfectivo ?? capitalFinal + efectivoDisponible,
        efectivoDisponible,
        efectivoUsado,
        gastosPrevisto,
        gastosReal,
        gananciasPrevisto,
        gananciasReal,
        flujoNetoReal: gananciasReal - gastosReal,
        flujoNetoPrevisto: gananciasPrevisto - gastosPrevisto,
        ahorroCambio
      },
      expenseCategories: Array.from(expenseCategories.values()),
      expenseItems,
      incomeGroups: Array.from(incomeGroups.values()),
      incomeItems,
      receivables: {
        items: receivableItems,
        total: receivablesTotal,
        paid: receivablesPaid,
        pending: Math.max(0, receivablesTotal - receivablesPaid)
      }
    };
  }

  // --- Arquetipo B: Bloques de Deudas / Préstamos / Cuotas / Equipamiento (DEUDAS, HERRAMIENTAS) ---
  function extractDebtOrAssetBlocksSheet(rawSheet, currency) {
    const { grid, name, maxRow } = rawSheet;
    const blocks = [];
    let inCancelledZone = false;
    let currentBlock = null;

    const finalizeBlock = blk => {
      if (!blk) return;
      const sumMontoRows = blk.items.reduce((s, it) => s + (it.monto || 0), 0);
      const sumPagoRows = blk.items.reduce((s, it) => s + (it.pago || 0), 0);

      let totalMonto = blk.explicitTotalPrestamo ?? sumMontoRows;
      let totalPagado = blk.explicitTotalPagado ?? sumPagoRows;

      // Si en el Excel solo pusieron el monto de la cuota 1 pero pagaron más cuotas (ej. MILKI UENO), usar el mayor real
      if (totalMonto < sumMontoRows) totalMonto = sumMontoRows;
      if (blk.items.length > 1 && sumMontoRows > 0 && blk.items.filter(i => i.monto > 0).length === 1 && blk.items.length >= 4) {
        const unitCuota = blk.items.find(i => i.monto > 0)?.monto || 0;
        const estimatedFull = unitCuota * blk.items.length;
        if (estimatedFull >= totalPagado && totalMonto < totalPagado) {
          totalMonto = estimatedFull;
        }
      }

      const faltaPagar =
        blk.explicitFaltaPagar !== null && blk.explicitFaltaPagar >= 0
          ? blk.explicitFaltaPagar
          : Math.max(0, totalMonto - totalPagado);

      if (totalMonto > 0 || totalPagado > 0 || blk.items.length > 0) {
        blocks.push({
          title: blk.title,
          cancelled: blk.cancelled || (totalMonto > 0 && faltaPagar === 0 && totalPagado >= totalMonto),
          items: blk.items,
          totalMonto,
          totalPagado,
          faltaPagar,
          paidCount: blk.items.filter(i => i.pago > 0).length,
          totalCount: blk.items.length
        });
      }
    };

    for (let r = 1; r <= maxRow; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;

      const colA = (getCell(grid, r, 0)?.text || '').trim();
      const colB = getCell(grid, r, 1);
      const colC = getCell(grid, r, 2);
      const colD = getCell(grid, r, 3);
      const normA = normPlain(colA);

      if (/^cancelados?$/i.test(normA)) {
        finalizeBlock(currentBlock);
        currentBlock = null;
        inCancelledZone = true;
        continue;
      }

      if (/^monto$/i.test(colB?.text || '') && /^pago$/i.test(colC?.text || '')) {
        if (!currentBlock) {
          const prevTitle = (getCell(grid, r - 1, 0)?.text || name).trim();
          currentBlock = {
            title: prevTitle,
            cancelled: inCancelledZone,
            items: [],
            explicitTotalPagado: null,
            explicitTotalPrestamo: null,
            explicitFaltaPagar: null
          };
        }
        continue;
      }

      if (/^total\s+pagado/i.test(normA)) {
        if (currentBlock) {
          const val = colC?.num ?? colB?.num ?? null;
          if (val !== null) currentBlock.explicitTotalPagado = val;
        }
        continue;
      }

      if (/^total\s+(prestamo|cuotas)/i.test(normA)) {
        if (currentBlock) {
          const val = colB?.num ?? colC?.num ?? null;
          if (val !== null) currentBlock.explicitTotalPrestamo = val;
        }
        continue;
      }

      if (/^falta\s+pagar/i.test(normA)) {
        if (currentBlock) {
          const val = colC?.num ?? colB?.num ?? null;
          if (val !== null) currentBlock.explicitFaltaPagar = val;
          finalizeBlock(currentBlock);
          currentBlock = null;
        }
        continue;
      }

      // Detectar título de nuevo bloque cuando Col A tiene texto y Col B/C no tienen números (o dicen CANCELADO)
      const bNum = colB?.num ?? null;
      const cNum = colC?.num ?? null;
      const rowHasCancelado =
        /cancelado/i.test(colC?.text || '') || /cancelado/i.test(colD?.text || '');

      if (colA && bNum === null && cNum === null && !/^cuota\s*\d+/i.test(normA)) {
        finalizeBlock(currentBlock);
        currentBlock = {
          title: colA,
          cancelled: inCancelledZone || rowHasCancelado,
          items: [],
          explicitTotalPagado: null,
          explicitTotalPrestamo: null,
          explicitFaltaPagar: null
        };
        continue;
      }

      if (colA && (bNum !== null || cNum !== null)) {
        if (!currentBlock) {
          currentBlock = {
            title: name,
            cancelled: inCancelledZone,
            items: [],
            explicitTotalPagado: null,
            explicitTotalPrestamo: null,
            explicitFaltaPagar: null
          };
        }
        currentBlock.items.push({
          label: colA,
          monto: bNum ?? 0,
          pago: cNum ?? 0
        });
      }
    }
    finalizeBlock(currentBlock);

    const activeBlocks = blocks.filter(b => !b.cancelled);
    const settledBlocks = blocks.filter(b => b.cancelled);
    const isAssetWishlist = /herramienta|equipo|inversion|activo/i.test(normPlain(name));

    return {
      ...rawSheet,
      archetype: isAssetWishlist ? 'asset_goals' : 'debt_blocks',
      shortLabel: name,
      currency,
      blocks,
      activeBlocks,
      settledBlocks,
      totals: {
        activeMonto: activeBlocks.reduce((s, b) => s + b.totalMonto, 0),
        activePagado: activeBlocks.reduce((s, b) => s + b.totalPagado, 0),
        activeFalta: activeBlocks.reduce((s, b) => s + b.faltaPagar, 0),
        allMonto: blocks.reduce((s, b) => s + b.totalMonto, 0),
        allPagado: blocks.reduce((s, b) => s + b.totalPagado, 0)
      }
    };
  }

  // --- Arquetipo C: Tarjetas de Crédito (TARJETAS DE CREDITO) ---
  function extractCreditCardsSheet(rawSheet, currency) {
    const { grid, name, maxRow } = rawSheet;
    const cards = [];

    for (let r = 1; r <= maxRow; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      const texts = Array.from(rowMap.values()).map(c => normPlain(c.text));
      if (texts.includes('total') && texts.includes('consumo')) {
        // Fila anterior suele tener Banco + Titular
        const prevRow = grid.get(r - 1);
        const titleParts = prevRow
          ? Array.from(prevRow.values())
              .map(c => c.text)
              .filter(Boolean)
          : [`Tarjeta ${cards.length + 1}`];
        const valRow = grid.get(r + 1);
        let totalCol = 1;
        let consumoCol = 2;
        let faltaCol = 3;
        for (const [cIdx, c] of rowMap.entries()) {
          const tn = normPlain(c.text);
          if (tn === 'total') totalCol = cIdx;
          else if (tn === 'consumo') consumoCol = cIdx;
          else if (tn.includes('falta')) faltaCol = cIdx;
        }
        const totalVal = valRow?.get(totalCol)?.num ?? 0;
        const consumoVal = valRow?.get(consumoCol)?.num ?? 0;
        const faltaVal = valRow?.get(faltaCol)?.num ?? Math.max(0, totalVal - consumoVal);
        cards.push({
          title: titleParts.join(' · ') || `Tarjeta ${cards.length + 1}`,
          total: totalVal,
          consumo: consumoVal,
          faltaPagar: faltaVal
        });
      }
    }

    return {
      ...rawSheet,
      archetype: 'credit_cards',
      shortLabel: 'Tarjetas Crédito',
      currency,
      cards,
      totals: {
        totalLinea: cards.reduce((s, c) => s + c.total, 0),
        totalConsumo: cards.reduce((s, c) => s + c.consumo, 0),
        totalFalta: cards.reduce((s, c) => s + c.faltaPagar, 0)
      }
    };
  }

  // --- Arquetipo D: Calendario / Fecha de Pagos (FECHA DE PAGOS) ---
  function extractPaymentScheduleSheet(rawSheet, currency) {
    const { grid, name, maxRow } = rawSheet;
    const schedules = [];
    const alerts = [];
    let currentSched = null;

    for (let r = 1; r <= maxRow; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      const colA = (getCell(grid, r, 0)?.text || '').trim();
      const normA = normPlain(colA);

      if (/^calendario\s+de\s+pagos/i.test(normA)) {
        if (currentSched && currentSched.rows.length > 0) schedules.push(currentSched);
        currentSched = {
          title: colA.replace(/^calendario\s+de\s+pagos\s*[—\-:]\s*/i, '').trim() || colA,
          periodSubtitle: (getCell(grid, r + 1, 0)?.text || '').trim(),
          totalCol: 3,
          stateCol: 4,
          conceptCol: 5,
          amountCols: [1, 2],
          rows: []
        };
        continue;
      }

      if (/^pago\s+pendiente/i.test(normA)) {
        const amt = findNextNumberRight(grid, r, 0, 5) ?? 0;
        alerts.push({ label: colA.trim(), amount: amt });
        continue;
      }

      if (currentSched && /^mes$/i.test(normA)) {
        const amtCols = [];
        for (const [cIdx, cell] of rowMap.entries()) {
          const tn = normPlain(cell.text);
          if (tn === 'total') currentSched.totalCol = cIdx;
          else if (tn === 'estado') currentSched.stateCol = cIdx;
          else if (tn === 'concepto') currentSched.conceptCol = cIdx;
          else if (cIdx > 0 && cIdx < 4) amtCols.push(cIdx);
        }
        if (amtCols.length > 0) currentSched.amountCols = amtCols;
        continue;
      }

      if (currentSched && colA && !/abril\s+a\s+|septiembre\s+a\s+/i.test(normA)) {
        const partialSum = currentSched.amountCols.reduce((s, c) => s + (getCell(grid, r, c)?.num ?? 0), 0);
        const explicitTotal = getCell(grid, r, currentSched.totalCol)?.num ?? 0;
        const estado = (getCell(grid, r, currentSched.stateCol)?.text || '').trim();
        const concepto = (getCell(grid, r, currentSched.conceptCol)?.text || '').trim();
        const effectiveAmount = Math.max(explicitTotal, partialSum);

        if (effectiveAmount > 0 || estado) {
          const isPending = /falta|pendiente|mitad/i.test(normPlain(estado));
          const isPaid = !isPending && /pagado|cancelado/i.test(normPlain(estado));
          currentSched.rows.push({
            period: colA,
            amount: effectiveAmount,
            paidAmount: isPaid ? effectiveAmount : /mitad/i.test(normPlain(estado)) ? explicitTotal * 0.5 : 0,
            pendingAmount: isPending
              ? explicitTotal > 0 && /mitad/i.test(normPlain(estado))
                ? explicitTotal * 0.5
                : partialSum > explicitTotal && explicitTotal === 0
                  ? partialSum
                  : Math.max(partialSum - explicitTotal, explicitTotal || partialSum)
              : 0,
            estado: estado || 'Programado',
            concepto
          });
        }
      }
    }
    if (currentSched && currentSched.rows.length > 0) schedules.push(currentSched);

    schedules.forEach(sc => {
      sc.totalPaid = sc.rows.reduce((s, x) => s + x.paidAmount, 0);
      sc.totalPending = sc.rows.reduce((s, x) => s + x.pendingAmount, 0);
    });

    return {
      ...rawSheet,
      archetype: 'payment_schedule',
      shortLabel: 'Fecha de Pagos',
      currency,
      schedules,
      alerts
    };
  }

  // --- Arquetipo E: Tabla Financiera General (cualquier otro Excel / CSV corporativo o personal) ---
  function extractGenericFinancialTableSheet(rawSheet, currency) {
    const { grid, name, maxRow } = rawSheet;
    const inflows = [];
    const outflows = [];
    const neutralItems = [];

    for (let r = 1; r <= maxRow; r++) {
      const rowMap = grid.get(r);
      if (!rowMap) continue;
      const cells = Array.from(rowMap.values());
      const firstText = cells.find(c => c.num === null && c.text.length >= 2);
      const nums = cells.filter(c => c.num !== null && Math.abs(c.num) > 0);
      if (!firstText || nums.length === 0) continue;

      const lbl = firstText.text.slice(0, 44);
      const ln = normPlain(lbl);
      if (/^(total|totales|subtotal|resumen|rubro|concepto|descripcion|fecha|mes)$/i.test(ln)) continue;

      const val = nums[nums.length - 1].num;
      if (/ingreso|venta|ganancia|cobro|sueldo|honorario|abono|entrada/i.test(ln)) {
        inflows.push({ label: lbl, amount: Math.abs(val) });
      } else if (/gasto|costo|egreso|pago|cuota|deuda|impuesto|alquiler|compra|comision|salida/i.test(ln) || val < 0) {
        outflows.push({ label: lbl, amount: Math.abs(val) });
      } else {
        neutralItems.push({ label: lbl, amount: val });
      }
    }

    return {
      ...rawSheet,
      archetype: 'general_table',
      shortLabel: name,
      currency,
      inflows,
      outflows,
      neutralItems,
      totals: {
        inflows: inflows.reduce((s, i) => s + i.amount, 0),
        outflows: outflows.reduce((s, i) => s + i.amount, 0)
      }
    };
  }

  // =========================================================================
  // 4. RESUMEN EJECUTIVO MULTI-HOJA PARA EL CONTEXTO DE LA IA
  // =========================================================================
  function formatWorkbookDigestForAI(wb) {
    if (!wb || !Array.isArray(wb.sheets)) return '';
    const cur = wb.currency || 'PYG';
    const out = [];
    out.push(
      `=== LIBRO FINANCIERO EXCEL: "${wb.fileName}" (${wb.sheetCount} hojas · Moneda: ${cur} · ${wb.totalFormulas} fórmulas) ===`
    );

    wb.sheets.forEach((sh, idx) => {
      out.push(`\n[Hoja ${idx + 1}/${wb.sheetCount}: "${sh.name}" · tipo=${sh.archetype}]`);
      if (sh.archetype === 'monthly_budget') {
        const k = sh.kpis;
        out.push(
          `  • Capital/Saldo Inicial: ${formatMoneyCompact(k.capitalInicial, cur)} | Capital/Saldo Final: ${formatMoneyCompact(k.capitalFinal, cur)} | Efectivo: ${formatMoneyCompact(k.efectivoDisponible, cur)}`
        );
        out.push(
          `  • Ingresos (Ganancias): Real ${formatMoneyCompact(k.gananciasReal, cur)} (Previsto ${formatMoneyCompact(k.gananciasPrevisto, cur)})`
        );
        out.push(
          `  • Gastos: Real ${formatMoneyCompact(k.gastosReal, cur)} (Previsto ${formatMoneyCompact(k.gastosPrevisto, cur)}) | Flujo Neto Real: ${formatMoneyCompact(k.flujoNetoReal, cur)}`
        );
        if (sh.incomeItems.length > 0) {
          const topInc = sh.incomeItems
            .slice()
            .sort((a, b) => (b.actual || b.planned) - (a.actual || a.planned))
            .slice(0, 8)
            .map(i => `${i.label}: real ${formatMoneyCompact(i.actual, cur)} / prev ${formatMoneyCompact(i.planned, cur)}`);
          out.push(`  • Fuentes de Ingreso (${sh.incomeItems.length}): ${topInc.join(' · ')}`);
        }
        if (sh.expenseCategories.length > 0) {
          const cats = sh.expenseCategories.map(
            c => `${c.name}: real ${formatMoneyCompact(c.actual, cur)} (prev ${formatMoneyCompact(c.planned, cur)}, ${c.items.length} ítems)`
          );
          out.push(`  • Categorías de Gasto: ${cats.join(' | ')}`);
        }
        if (sh.receivables.items.length > 0) {
          out.push(
            `  • Cuentas / Cancelación lateral: Total ${formatMoneyCompact(sh.receivables.total, cur)}, Cobrado/Cancelado ${formatMoneyCompact(sh.receivables.paid, cur)} (${sh.receivables.items.map(r => `${r.label}: ${formatMoneyCompact(r.amount, cur)}`).join(', ')})`
          );
        }
      } else if (sh.archetype === 'debt_blocks' || sh.archetype === 'asset_goals') {
        out.push(
          `  • Resumen Activo: Total ${formatMoneyCompact(sh.totals.activeMonto, cur)} | Pagado ${formatMoneyCompact(sh.totals.activePagado, cur)} | Falta Pagar ${formatMoneyCompact(sh.totals.activeFalta, cur)}`
        );
        sh.blocks.forEach(b => {
          out.push(
            `  • ${b.cancelled ? '[CANCELADO] ' : ''}${b.title}: Total ${formatMoneyCompact(b.totalMonto, cur)} | Pagado ${formatMoneyCompact(b.totalPagado, cur)} | Falta ${formatMoneyCompact(b.faltaPagar, cur)} (${b.paidCount}/${b.totalCount} ítems/cuotas)`
          );
          if (sh.archetype === 'asset_goals') {
            b.items.slice(0, 12).forEach(it => {
              out.push(
                `    - ${it.label}: Monto ${formatMoneyCompact(it.monto, cur)} | Pagado ${formatMoneyCompact(it.pago, cur)}`
              );
            });
          }
        });
      } else if (sh.archetype === 'credit_cards') {
        sh.cards.forEach(c => {
          out.push(
            `  • Tarjeta ${c.title}: Línea/Total ${formatMoneyCompact(c.total, cur)} | Consumo ${formatMoneyCompact(c.consumo, cur)} | Falta Pagar ${formatMoneyCompact(c.faltaPagar, cur)}`
          );
        });
      } else if (sh.archetype === 'payment_schedule') {
        sh.schedules.forEach(sc => {
          out.push(
            `  • Calendario "${sc.title}" (${sc.periodSubtitle}): Pagado ${formatMoneyCompact(sc.totalPaid, cur)} | Pendiente ${formatMoneyCompact(sc.totalPending, cur)} (${sc.rows.length} periodos)`
          );
        });
        sh.alerts.forEach(al => {
          out.push(`  • Alerta pendiente: ${al.label} (${formatMoneyCompact(al.amount, cur)})`);
        });
      } else {
        const sample = [...sh.inflows.slice(0, 6), ...sh.outflows.slice(0, 6), ...sh.neutralItems.slice(0, 6)];
        out.push(
          `  • Partidas detectadas (${sample.length}): ${sample.map(x => `${x.label}: ${formatMoneyCompact(x.amount, cur)}`).join(' · ')}`
        );
      }
    });

    return out.join('\n');
  }

  // =========================================================================
  // 5. CONSTRUCTOR REACTIVO DE ÁRBOLES DE NODOS FINANCIEROS
  // =========================================================================
  function resolveRequestedWorkbookView(wb, promptText = '') {
    if (!wb || !Array.isArray(wb.sheets) || wb.sheets.length === 0) return 'master';
    if (wb.sheets.length === 1) return 'sheet:0';

    const p = normPlain(promptText);
    if (!p) return 'master';

    // Si el usuario pide explícitamente todo el libro / árbol general / todas las hojas
    if (/\b(todo\s+el\s+archivo|todas\s+las\s+hojas|consolidado|completo|general|sistema\s+completo)\b/.test(p)) {
      return 'master';
    }

    // Buscar coincidencia específica con alguna hoja por nombre o mes/tema
    for (let i = 0; i < wb.sheets.length; i++) {
      const shNorm = normPlain(wb.sheets[i].name);
      if (shNorm && p.includes(shNorm)) return `sheet:${i}`;
    }

    const keywordsToCheck = [
      { re: /\boctubre\b/, matchSheet: s => /octubre/i.test(s.name) },
      { re: /\b(septiembre|setiembre)\b/, matchSheet: s => /septiembre|setiembre/i.test(s.name) },
      { re: /\bagosto\b/, matchSheet: s => /agosto/i.test(s.name) },
      { re: /\bjulio\b/, matchSheet: s => /julio/i.test(s.name) },
      { re: /\bjunio\b/, matchSheet: s => /junio/i.test(s.name) },
      { re: /\btarjeta\w*\b/, matchSheet: s => s.archetype === 'credit_cards' },
      { re: /\b(fecha\w*\s+de\s+pago\w*|calendario\w*)\b/, matchSheet: s => s.archetype === 'payment_schedule' },
      { re: /\b(herramienta\w*|equipamiento|camara|kit\s+luces)\b/, matchSheet: s => s.archetype === 'asset_goals' || /herramienta/i.test(s.name) },
      { re: /\b(solo\s+deuda\w*|hoja\s+de\s+deuda\w*|prestamo\w*\s+y\s+cuota\w*)\b/, matchSheet: s => s.archetype === 'debt_blocks' }
    ];

    for (const rule of keywordsToCheck) {
      if (rule.re.test(p)) {
        const idx = wb.sheets.findIndex(rule.matchSheet);
        if (idx >= 0) return `sheet:${idx}`;
      }
    }

    return 'master';
  }

  function createTreeBuilder(currency) {
    const ops = [
      { op: 'clear_canvas' },
      { op: 'set_currency', currency: currency || 'PYG' }
    ];
    let cellCounter = 0;

    const addNode = (ref, type, text, value, extraParams = {}, note = '') => {
      const cellRef = extraParams.cellRef || makeSheetCellRef(cellCounter++);
      const format = extraParams.format || (type.includes('margin') || type.includes('variance') || type === 'fin_rate' ? 'percent' : 'currency');
      ops.push({
        op: 'add_node',
        ref,
        type,
        text: String(text || '').slice(0, 48),
        note: note || undefined,
        params: {
          cellRef,
          value: Number.isFinite(Number(value)) ? Number(value) : 0,
          format,
          ...extraParams
        }
      });
      return ref;
    };

    const addEdge = (from, to, label = '') => {
      ops.push({ op: 'add_edge', from, to, label });
    };

    return { ops, addNode, addEdge };
  }

  // Construye el Árbol Maestro conectando TODAS las hojas del archivo Excel
  function buildMasterWorkbookTree(wb) {
    const cur = wb.currency || 'PYG';
    const { ops, addNode, addEdge } = createTreeBuilder(cur);

    const monthlySheets = wb.sheets
      .filter(s => s.archetype === 'monthly_budget')
      .slice()
      .reverse(); // Orden cronológico: Junio -> Octubre

    const monthIncRefs = [];
    const monthExpRefs = [];

    monthlySheets.forEach((sh, idx) => {
      const k = sh.kpis;
      const mTag = sh.shortLabel.replace(/\s+20\d\d$/, '');
      const incRef = `m_inc_${idx}`;
      const expRef = `m_exp_${idx}`;
      const netRef = `m_net_${idx}`;

      const topIncNote = sh.incomeItems
        .slice(0, 6)
        .map(i => `• ${i.label}: ${formatMoneyCompact(i.actual || i.planned, cur)}`)
        .join('\n');
      const topExpNote = sh.expenseCategories
        .map(c => `• ${c.name}: ${formatMoneyCompact(c.actual || c.planned, cur)}`)
        .join('\n');

      addNode(
        incRef,
        'fin_revenue',
        `Ingresos ${mTag}`,
        k.gananciasReal,
        { subtitle: `Previsto: ${formatMoneyCompact(k.gananciasPrevisto, cur)}` },
        `Hoja: ${sh.name}\nGanancias Reales: ${formatMoneyCompact(k.gananciasReal, cur)}\nPrevisto: ${formatMoneyCompact(k.gananciasPrevisto, cur)}\n${topIncNote}`
      );
      addNode(
        expRef,
        'fin_opex',
        `Gastos ${mTag}`,
        k.gastosReal,
        { subtitle: `Previsto: ${formatMoneyCompact(k.gastosPrevisto, cur)}` },
        `Hoja: ${sh.name}\nGastos Reales: ${formatMoneyCompact(k.gastosReal, cur)}\nPrevisto: ${formatMoneyCompact(k.gastosPrevisto, cur)}\n${topExpNote}`
      );
      addNode(
        netRef,
        'fin_ocf',
        `Flujo Neto ${mTag}`,
        k.flujoNetoReal,
        { subtitle: `Saldo Fin: ${formatMoneyCompact(k.capitalFinal, cur)}` },
        `Saldo Inicial: ${formatMoneyCompact(k.capitalInicial, cur)}\nSaldo Final: ${formatMoneyCompact(k.capitalFinal, cur)}\nEfectivo: ${formatMoneyCompact(k.efectivoDisponible, cur)}`
      );

      addEdge(incRef, netRef, '+');
      addEdge(expRef, netRef, '-');
      monthIncRefs.push(incRef);
      monthExpRefs.push(expRef);
    });

    // Consolidadores de Flujo Operativo Acumulado
    let totalIncRef = null;
    let totalExpRef = null;
    let netOperatingRef = null;

    if (monthIncRefs.length > 0) {
      totalIncRef = addNode('tot_inc_all', 'fin_sum', `Ingresos Reales (${monthIncRefs.length}m)`, 0, {
        subtitle: 'Suma histórica de hojas mensuales'
      });
      monthIncRefs.forEach(r => addEdge(r, totalIncRef, '+'));

      totalExpRef = addNode('tot_exp_all', 'fin_sum', `Gastos Reales (${monthExpRefs.length}m)`, 0, {
        subtitle: 'Egresos ejecutados acumulados'
      });
      monthExpRefs.forEach(r => addEdge(r, totalExpRef, '+'));

      netOperatingRef = addNode('net_oper_all', 'fin_net_income', 'Balance Operativo Acumulado', 0, {
        subtitle: 'Ingresos - Gastos acumulados'
      });
      addEdge(totalIncRef, netOperatingRef, '+');
      addEdge(totalExpRef, netOperatingRef, '-');
    }

    // Liquidez actual del mes más reciente (primera hoja mensual en el libro)
    const latestMonth = wb.sheets.find(s => s.archetype === 'monthly_budget');
    let liquidityRef = null;
    if (latestMonth) {
      const capBanco = latestMonth.kpis.capitalFinal || 0;
      const capEfec = latestMonth.kpis.efectivoDisponible || 0;
      const bRef = addNode(
        'liq_bank',
        'fin_cash_in',
        `Capital Actual (${latestMonth.shortLabel.split(' ')[0]})`,
        capBanco,
        { subtitle: 'Saldo en cuenta / banco' }
      );
      const cRef = addNode('liq_cash', 'fin_cash_in', 'Efectivo en Mano', capEfec, {
        subtitle: `Usados: ${formatMoneyCompact(latestMonth.kpis.efectivoUsado, cur)}`
      });
      liquidityRef = addNode('liq_total', 'fin_sum', 'Liquidez Disponible Total', 0, {
        subtitle: 'Banco + Efectivo actual'
      });
      addEdge(bRef, liquidityRef, '+');
      addEdge(cRef, liquidityRef, '+');
    }

    // Rama DEUDAS ACTIVAS
    const debtSheet = wb.sheets.find(s => s.archetype === 'debt_blocks');
    let debtTotalRef = null;
    if (debtSheet && debtSheet.activeBlocks.length > 0) {
      const dRefs = [];
      debtSheet.activeBlocks.slice(0, 7).forEach((blk, idx) => {
        const ref = addNode(
          `debt_b_${idx}`,
          'fin_cash_out',
          `Deuda: ${blk.title}`,
          blk.faltaPagar,
          { subtitle: `Pagado: ${formatMoneyCompact(blk.totalPagado, cur)}` },
          `Hoja: ${debtSheet.name}\nTotal Préstamo: ${formatMoneyCompact(blk.totalMonto, cur)}\nTotal Pagado: ${formatMoneyCompact(blk.totalPagado, cur)}\nFalta Pagar: ${formatMoneyCompact(blk.faltaPagar, cur)}\nProgreso: ${blk.paidCount}/${blk.totalCount} cuotas`
        );
        dRefs.push(ref);
      });
      debtTotalRef = addNode('debt_total_active', 'fin_sum', 'Total Deudas por Pagar', 0, {
        subtitle: `${debtSheet.activeBlocks.length} compromisos activos`
      });
      dRefs.forEach(r => addEdge(r, debtTotalRef, '+'));
    }

    // Rama TARJETAS DE CRÉDITO
    const cardSheet = wb.sheets.find(s => s.archetype === 'credit_cards');
    if (cardSheet && cardSheet.cards.length > 0) {
      const activeCards = cardSheet.cards.filter(c => c.total > 0 || c.consumo > 0);
      const cardList = activeCards.length > 0 ? activeCards : cardSheet.cards.slice(0, 2);
      const cRefs = cardList.map((c, i) =>
        addNode(
          `cc_${i}`,
          'fin_input',
          `TC ${c.title}`,
          c.consumo || c.total,
          { subtitle: `Falta pagar: ${formatMoneyCompact(c.faltaPagar, cur)}` },
          `Hoja: ${cardSheet.name}\nLínea/Total: ${formatMoneyCompact(c.total, cur)}\nConsumo: ${formatMoneyCompact(c.consumo, cur)}\nFalta Pagar: ${formatMoneyCompact(c.faltaPagar, cur)}`
        )
      );
      const ccSumRef = addNode('cc_total', 'fin_sum', 'Cupo / Consumo Tarjetas', 0, {
        subtitle: `${cardSheet.cards.length} tarjetas registradas`
      });
      cRefs.forEach(r => addEdge(r, ccSumRef, '+'));
    }

    // Rama FECHA DE PAGOS (Calendarios pendientes)
    const schedSheet = wb.sheets.find(s => s.archetype === 'payment_schedule');
    let schedPendingRef = null;
    if (schedSheet && schedSheet.schedules.length > 0) {
      const sRefs = schedSheet.schedules.map((sc, i) =>
        addNode(
          `sched_${i}`,
          'fin_cash_out',
          `Calendario: ${sc.title}`,
          sc.totalPending,
          { subtitle: `Pagado: ${formatMoneyCompact(sc.totalPaid, cur)}` },
          `Hoja: ${schedSheet.name} (${sc.periodSubtitle})\nPagado: ${formatMoneyCompact(sc.totalPaid, cur)}\nPendiente: ${formatMoneyCompact(sc.totalPending, cur)}`
        )
      );
      schedPendingRef = addNode('sched_total', 'fin_sum', 'Pagos Programados Pend.', 0, {
        subtitle: 'Calendario Fecha de Pagos'
      });
      sRefs.forEach(r => addEdge(r, schedPendingRef, '+'));
    }

    // Rama HERRAMIENTAS / METAS DE EQUIPAMIENTO
    const assetSheet = wb.sheets.find(s => s.archetype === 'asset_goals');
    if (assetSheet && assetSheet.blocks.length > 0) {
      const metaTotal = assetSheet.totals.allMonto;
      const metaPagado = assetSheet.totals.allPagado;
      const itemsNote = assetSheet.blocks
        .flatMap(b => b.items)
        .map(it => `• ${it.label}: ${formatMoneyCompact(it.monto, cur)}${it.pago > 0 ? ` (pagado ${formatMoneyCompact(it.pago, cur)})` : ''}`)
        .join('\n');
      const mGoalRef = addNode(
        'goal_total',
        'fin_capex',
        'Meta Herramientas / Equipos',
        metaTotal,
        { subtitle: `${assetSheet.blocks.reduce((s, b) => s + b.items.length, 0)} activos en lista` },
        `Hoja: ${assetSheet.name}\n${itemsNote}`
      );
      const mPaidRef = addNode('goal_paid', 'fin_cash_in', 'Pagado en Equipamiento', metaPagado, {
        subtitle: 'Avance ejecutado'
      });
      const mRemRef = addNode('goal_rem', 'fin_subtract', 'Falta Meta Herramientas', 0, {
        subtitle: 'Inversión restante objetivo'
      });
      addEdge(mGoalRef, mRemRef, '+');
      addEdge(mPaidRef, mRemRef, '-');
    }

    // Si había hojas genéricas (otro tipo de Excel), integrarlas también
    wb.sheets
      .filter(s => s.archetype === 'general_table')
      .forEach((sh, idx) => {
        const gIn = addNode(`gen_in_${idx}`, 'fin_revenue', `Entradas ${sh.shortLabel}`, sh.totals.inflows);
        const gOut = addNode(`gen_out_${idx}`, 'fin_opex', `Salidas ${sh.shortLabel}`, sh.totals.outflows);
        const gNet = addNode(`gen_net_${idx}`, 'fin_net_income', `Resultado ${sh.shortLabel}`, 0);
        addEdge(gIn, gNet, '+');
        addEdge(gOut, gNet, '-');
        if (!netOperatingRef) netOperatingRef = gNet;
      });

    // Nodo de Posición Patrimonial Neta (Liquidez vs Deuda Activa)
    if (liquidityRef && debtTotalRef) {
      const netWorthRef = addNode('patrimonio_neto_liq', 'fin_subtract', 'Liquidez vs Deuda Total', 0, {
        subtitle: 'Disponible menos deuda activa'
      });
      addEdge(liquidityRef, netWorthRef, '+');
      addEdge(debtTotalRef, netWorthRef, '-');
    }

    // Gráficas reactivas y Veredicto Final conectados a la raíz operativa
    if (netOperatingRef && totalIncRef && totalExpRef) {
      const vRef = addNode('chart_verdict', 'fin_verdict_kpi', 'Diagnóstico Sistema Financiero', 0);
      addEdge(netOperatingRef, vRef, '=');

      const pnlChartRef = addNode('chart_pnl', 'fin_chart_pnl', 'Comparativa Ingresos vs Gastos', 0);
      addEdge(totalIncRef, pnlChartRef, '+');
      addEdge(totalExpRef, pnlChartRef, '-');

      const ringRef = addNode('chart_ring', 'fin_chart_breakdown', 'Distribución Gasto vs Ahorro', 0);
      addEdge(totalIncRef, ringRef, '+');
      addEdge(totalExpRef, ringRef, '-');
    }

    ops.push({ op: 'organize_canvas', mode: 'tree_lr', density: 'normal' });
    return {
      viewKey: 'master',
      viewLabel: `Árbol Maestro (${wb.sheetCount} hojas)`,
      summary: `Árbol financiero completo de "${wb.title}" (${wb.sheetCount} hojas · ${ops.filter(o => o.op === 'add_node').length} nodos)`,
      operations: ops
    };
  }

  // Construye el Árbol Detallado de una Hoja Específica
  function buildSingleSheetTree(wb, sheetIndex) {
    const sh = wb.sheets[sheetIndex] || wb.sheets[0];
    const cur = wb.currency || 'PYG';
    const { ops, addNode, addEdge } = createTreeBuilder(cur);

    if (sh.archetype === 'monthly_budget') {
      const k = sh.kpis;
      const useRealInc = k.gananciasReal > 0;

      // 1. Nodos de Fuentes de Ingresos del mes (ordenados por monto real cobrado para priorizar ingresos efectivos)
      const incRefs = [];
      const activeIncomes = sh.incomeItems
        .filter(i => i.actual > 0 || i.planned > 0)
        .slice()
        .sort((a, b) => (useRealInc ? b.actual - a.actual || b.planned - a.planned : b.planned - a.planned));

      const topIncomes = activeIncomes.slice(0, 11);
      let shownIncSum = 0;
      topIncomes.forEach((item, idx) => {
        const val = useRealInc ? item.actual : item.planned;
        shownIncSum += val;
        const ref = addNode(
          `sh_inc_${idx}`,
          'fin_revenue',
          `${item.label}`,
          val,
          { subtitle: `${item.group} · Prev: ${formatMoneyCompact(item.planned, cur)}` },
          `Grupo: ${item.group}\nReal cobrado: ${formatMoneyCompact(item.actual, cur)}\nProyección: ${formatMoneyCompact(item.planned, cur)}`
        );
        incRefs.push(ref);
      });

      const targetIncTotal = useRealInc ? k.gananciasReal : k.gananciasPrevisto;
      if (targetIncTotal > shownIncSum) {
        const restCount = Math.max(1, activeIncomes.length - topIncomes.length);
        const restIncRef = addNode(
          'sh_inc_rest',
          'fin_revenue',
          `Otros Ingresos (${restCount})`,
          targetIncTotal - shownIncSum,
          { subtitle: 'Partidas adicionales cobradas del mes' }
        );
        incRefs.push(restIncRef);
      }

      const totIncRef = addNode('sh_tot_inc', 'fin_sum', `Total Ingresos (${sh.shortLabel})`, targetIncTotal, {
        subtitle: `Meta prevista: ${formatMoneyCompact(k.gananciasPrevisto, cur)}`
      });
      incRefs.forEach(r => addEdge(r, totIncRef, '+'));

      // 2. Nodos de Categorías e Ítems principales de Gasto
      const catRefs = [];
      let shownCatExpSum = 0;
      sh.expenseCategories.forEach((cat, cIdx) => {
        const itemRefs = [];
        const sortedItems = cat.items
          .filter(i => i.actual > 0 || i.planned > 0)
          .sort((a, b) => (b.actual || b.planned) - (a.actual || a.planned));

        sortedItems.slice(0, 6).forEach((it, iIdx) => {
          const val = it.actual > 0 ? it.actual : 0;
          if (val <= 0 && cat.actual > 0) return;
          const iRef = addNode(
            `sh_exp_${cIdx}_${iIdx}`,
            /deuda|ueno|prestamo|tio/i.test(cat.name + ' ' + it.label) ? 'fin_cash_out' : 'fin_opex',
            it.label,
            it.actual > 0 ? it.actual : it.planned,
            { subtitle: `Previsto: ${formatMoneyCompact(it.planned, cur)}` },
            `Categoría: ${cat.name}\nReal: ${formatMoneyCompact(it.actual, cur)}\nPrevisto: ${formatMoneyCompact(it.planned, cur)}`
          );
          itemRefs.push(iRef);
        });

        // Si había más ítems pequeños en la categoría, consolidarlos en un nodo "Otros de categoría" para que la suma sea 100% exacta
        const shownSum = sortedItems
          .slice(0, 6)
          .reduce((s, it) => s + (cat.actual > 0 ? (it.actual > 0 ? it.actual : 0) : it.planned), 0);
        const targetCatVal = cat.actual > 0 ? cat.actual : cat.planned;
        if (targetCatVal > shownSum && itemRefs.length > 0) {
          const restRef = addNode(
            `sh_exp_rest_${cIdx}`,
            'fin_opex',
            `Otros (${cat.name})`,
            targetCatVal - shownSum,
            { subtitle: 'Partidas menores del mes' }
          );
          itemRefs.push(restRef);
        }

        const catSubRef = addNode(
          `sh_cat_${cIdx}`,
          itemRefs.length > 0 ? 'fin_sum' : 'fin_opex',
          `${cat.name}`,
          targetCatVal,
          { subtitle: `Previsto: ${formatMoneyCompact(cat.planned, cur)}` },
          cat.items.map(x => `• ${x.label}: real ${formatMoneyCompact(x.actual, cur)} / prev ${formatMoneyCompact(x.planned, cur)}`).join('\n')
        );
        itemRefs.forEach(r => addEdge(r, catSubRef, '+'));
        catRefs.push(catSubRef);
        shownCatExpSum += targetCatVal;
      });

      const targetExpTotal = k.gastosReal > 0 ? k.gastosReal : k.gastosPrevisto;
      if (targetExpTotal > shownCatExpSum && catRefs.length > 0) {
        const miscExpRef = addNode(
          'sh_cat_misc',
          'fin_opex',
          'Otros Gastos / Ajustes',
          targetExpTotal - shownCatExpSum,
          { subtitle: 'Partidas rápidas sin sub-bloque' }
        );
        catRefs.push(miscExpRef);
      }

      const totExpRef = addNode('sh_tot_exp', 'fin_sum', `Total Gastos (${sh.shortLabel})`, targetExpTotal, {
        subtitle: `Presupuesto: ${formatMoneyCompact(k.gastosPrevisto, cur)}`
      });
      catRefs.forEach(r => addEdge(r, totExpRef, '+'));

      // 3. Flujo Neto y Evolución de Capital del Mes
      const netMonthRef = addNode('sh_net_month', 'fin_net_income', `Resultado Neto ${sh.shortLabel}`, 0, {
        subtitle: 'Ganancias Reales - Gastos Reales'
      });
      addEdge(totIncRef, netMonthRef, '+');
      addEdge(totExpRef, netMonthRef, '-');

      const capIniRef = addNode('sh_cap_ini', 'fin_input', 'Capital / Saldo Inicial', k.capitalInicial, {
        subtitle: 'Arranque del mes'
      });
      const capFinRef = addNode('sh_cap_fin', 'fin_sum', 'Capital Final en Cuenta', 0, {
        subtitle: `Efectivo extra: ${formatMoneyCompact(k.efectivoDisponible, cur)}`
      });
      addEdge(capIniRef, capFinRef, '+');
      addEdge(netMonthRef, capFinRef, '+');

      // 4. Tabla lateral Cuentas por Cobrar / Cancelación si existe
      if (sh.receivables.items.length > 0) {
        const recRefs = sh.receivables.items.map((rc, idx) =>
          addNode(
            `sh_rec_${idx}`,
            'fin_cash_in',
            `Cliente: ${rc.label}`,
            rc.amount,
            { subtitle: `Cobrado/Canc.: ${formatMoneyCompact(rc.paid, cur)}` }
          )
        );
        const recTot = addNode('sh_rec_tot', 'fin_sum', 'Total Cartera / Cancelación', 0, {
          subtitle: `Ejecutado: ${formatMoneyCompact(sh.receivables.paid, cur)}`
        });
        recRefs.forEach(r => addEdge(r, recTot, '+'));
      }

      // 5. Gráficas del mes
      const vRef = addNode('sh_verdict', 'fin_verdict_kpi', `Veredicto ${sh.shortLabel}`, 0);
      addEdge(netMonthRef, vRef, '=');
      const cRef = addNode('sh_chart_pnl', 'fin_chart_pnl', `Ingresos vs Gastos (${sh.shortLabel})`, 0);
      addEdge(totIncRef, cRef, '+');
      addEdge(totExpRef, cRef, '-');
    } else if (sh.archetype === 'debt_blocks' || sh.archetype === 'asset_goals') {
      const saldoRefs = [];
      const montoRefs = [];
      const pagoRefs = [];

      const targetBlocks = sh.activeBlocks.length > 0 ? sh.activeBlocks : sh.blocks;

      // Si es un solo bloque con múltiples activos (ej. HERRAMIENTAS), desglosar cada activo como rama propia
      if (targetBlocks.length === 1 && targetBlocks[0].items.length >= 2 && sh.archetype === 'asset_goals') {
        const blk = targetBlocks[0];
        const itemRefs = blk.items.map((it, idx) =>
          addNode(
            `ast_it_${idx}`,
            'fin_capex',
            it.label,
            it.monto,
            { subtitle: it.pago > 0 ? `Pagado: ${formatMoneyCompact(it.pago, cur)}` : 'Pendiente adquirir' }
          )
        );
        const totGoalRef = addNode('ast_tot_goal', 'fin_sum', `Total ${blk.title}`, 0);
        itemRefs.forEach(r => addEdge(r, totGoalRef, '+'));

        const paidRef = addNode('ast_paid', 'fin_cash_in', 'Total Ya Pagado', blk.totalPagado);
        const remRef = addNode('ast_rem', 'fin_subtract', 'Falta Pagar Equipamiento', 0);
        addEdge(totGoalRef, remRef, '+');
        addEdge(paidRef, remRef, '-');

        const chartRef = addNode('ast_chart', 'fin_chart_pnl', 'Meta Total vs Ya Pagado', 0);
        addEdge(totGoalRef, chartRef, '+');
        addEdge(paidRef, chartRef, '-');
      } else {
        targetBlocks.forEach((blk, idx) => {
          const mRef = addNode(
            `db_m_${idx}`,
            'fin_input',
            `Préstamo: ${blk.title}`,
            blk.totalMonto,
            { subtitle: `${blk.totalCount} cuotas registradas` },
            blk.items.slice(0, 12).map(c => `• ${c.label}: monto ${formatMoneyCompact(c.monto, cur)} | pago ${formatMoneyCompact(c.pago, cur)}`).join('\n')
          );
          const pRef = addNode(
            `db_p_${idx}`,
            'fin_cash_in',
            `Pagado: ${blk.title}`,
            blk.totalPagado,
            { subtitle: `${blk.paidCount}/${blk.totalCount} cuotas cubiertas` }
          );
          const sRef = addNode(
            `db_s_${idx}`,
            'fin_subtract',
            `Falta: ${blk.title}`,
            0,
            { subtitle: 'Saldo insoluto pendiente' }
          );
          addEdge(mRef, sRef, '+');
          addEdge(pRef, sRef, '-');
          montoRefs.push(mRef);
          pagoRefs.push(pRef);
          saldoRefs.push(sRef);
        });

        const totMRef = addNode('db_tot_m', 'fin_sum', 'Deuda Activa Contratada', 0);
        montoRefs.forEach(r => addEdge(r, totMRef, '+'));

        const totPRef = addNode('db_tot_p', 'fin_sum', 'Total Amortizado (Pagado)', 0);
        pagoRefs.forEach(r => addEdge(r, totPRef, '+'));

        const totSRef = addNode('db_tot_s', 'fin_sum', 'Saldo Total Falta Pagar', 0);
        saldoRefs.forEach(r => addEdge(r, totSRef, '+'));

        if (sh.settledBlocks.length > 0) {
          addNode(
            'db_settled_info',
            'fin_cash_in',
            `Deudas Canceladas (${sh.settledBlocks.length})`,
            sh.settledBlocks.reduce((s, b) => s + b.totalPagado, 0),
            { subtitle: sh.settledBlocks.map(b => b.title).join(', ').slice(0, 36) }
          );
        }

        const cRef = addNode('db_chart', 'fin_chart_pnl', 'Deuda Total vs Amortizado', 0);
        addEdge(totMRef, cRef, '+');
        addEdge(totPRef, cRef, '-');
      }
    } else if (sh.archetype === 'credit_cards') {
      const limRefs = [];
      const conRefs = [];
      sh.cards.forEach((c, idx) => {
        const lRef = addNode(`cc_l_${idx}`, 'fin_input', `Línea: ${c.title}`, c.total);
        const uRef = addNode(`cc_u_${idx}`, 'fin_opex', `Consumo: ${c.title}`, c.consumo);
        const fRef = addNode(`cc_f_${idx}`, 'fin_subtract', `Disponible / Saldo ${idx + 1}`, 0);
        addEdge(lRef, fRef, '+');
        addEdge(uRef, fRef, '-');
        limRefs.push(lRef);
        conRefs.push(uRef);
      });
      const totL = addNode('cc_tot_l', 'fin_sum', 'Línea Total Tarjetas', 0);
      limRefs.forEach(r => addEdge(r, totL, '+'));
      const totC = addNode('cc_tot_c', 'fin_sum', 'Consumo Total Tarjetas', 0);
      conRefs.forEach(r => addEdge(r, totC, '+'));
    } else if (sh.archetype === 'payment_schedule') {
      const pendRefs = [];
      const paidRefs = [];
      sh.schedules.forEach((sc, idx) => {
        const pRef = addNode(
          `ps_paid_${idx}`,
          'fin_cash_in',
          `Pagado: ${sc.title}`,
          sc.totalPaid,
          { subtitle: sc.periodSubtitle },
          sc.rows.map(r => `• ${r.period}: ${formatMoneyCompact(r.amount, cur)} [${r.estado}]`).join('\n')
        );
        const fRef = addNode(
          `ps_pend_${idx}`,
          'fin_cash_out',
          `Pendiente: ${sc.title}`,
          sc.totalPending,
          { subtitle: `${sc.rows.filter(r => r.pendingAmount > 0).length} fechas pendientes` }
        );
        paidRefs.push(pRef);
        pendRefs.push(fRef);
      });
      const totPaid = addNode('ps_tot_paid', 'fin_sum', 'Total Calendario Pagado', 0);
      paidRefs.forEach(r => addEdge(r, totPaid, '+'));
      const totPend = addNode('ps_tot_pend', 'fin_sum', 'Total Calendario Pendiente', 0);
      pendRefs.forEach(r => addEdge(r, totPend, '+'));
      const chart = addNode('ps_chart', 'fin_chart_pnl', 'Cumplimiento Calendario Pagos', 0);
      addEdge(totPaid, chart, '+');
      addEdge(totPend, chart, '-');
    } else {
      const inRefs = sh.inflows.slice(0, 8).map((it, i) => addNode(`gt_in_${i}`, 'fin_revenue', it.label, it.amount));
      const outRefs = sh.outflows.slice(0, 8).map((it, i) => addNode(`gt_out_${i}`, 'fin_opex', it.label, it.amount));
      const neutRefs = sh.neutralItems.slice(0, 8).map((it, i) => addNode(`gt_nt_${i}`, 'fin_input', it.label, it.amount));
      const allIn = [...inRefs, ...neutRefs];
      const totIn = addNode('gt_tot_in', 'fin_sum', `Total Base (${sh.shortLabel})`, 0);
      allIn.forEach(r => addEdge(r, totIn, '+'));
      if (outRefs.length > 0) {
        const totOut = addNode('gt_tot_out', 'fin_sum', `Total Salidas (${sh.shortLabel})`, 0);
        outRefs.forEach(r => addEdge(r, totOut, '+'));
        const net = addNode('gt_net', 'fin_net_income', `Resultado (${sh.shortLabel})`, 0);
        addEdge(totIn, net, '+');
        addEdge(totOut, net, '-');
      }
    }

    ops.push({ op: 'organize_canvas', mode: 'tree_lr', density: 'normal' });
    return {
      viewKey: `sheet:${sheetIndex}`,
      viewLabel: sh.shortLabel || sh.name,
      summary: `Árbol de hoja "${sh.name}" (${ops.filter(o => o.op === 'add_node').length} nodos reactivos)`,
      operations: ops
    };
  }

  function buildWorkbookTreeActions(wb, promptOrView = '') {
    if (!wb || !Array.isArray(wb.sheets) || wb.sheets.length === 0) return null;
    let viewKey = 'master';
    if (typeof promptOrView === 'string' && promptOrView.startsWith('sheet:')) {
      viewKey = promptOrView;
    } else {
      viewKey = resolveRequestedWorkbookView(wb, promptOrView);
    }

    if (viewKey.startsWith('sheet:')) {
      const idx = Math.max(0, Math.min(wb.sheets.length - 1, Number(viewKey.split(':')[1]) || 0));
      return buildSingleSheetTree(wb, idx);
    }
    return buildMasterWorkbookTree(wb);
  }

  // =========================================================================
  // 6. BARRA INTERACTIVA DE HOJAS EXCEL E IMPORTACIÓN DIRECTA EN FINANZAS
  // =========================================================================
  function renderWorkbookSheetsBar() {
    const bar = document.getElementById('finWorkbookSheetsBar');
    if (!bar) return;

    const inFinance = typeof isFinanceWorkspaceActive === 'function' ? isFinanceWorkspaceActive() : true;
    if (!activeFinancialWorkbook || !inFinance) {
      bar.hidden = true;
      return;
    }

    bar.hidden = false;
    const wb = activeFinancialWorkbook;
    const tabsHtml = [
      ...(wb.sheets.length > 1
        ? [
            `<button type="button" class="fin-wb-tab ${activeWorkbookViewKey === 'master' ? 'is-active' : ''}" data-wb-view="master" title="Ver árbol consolidado conectando las ${wb.sheetCount} hojas">Árbol Maestro (${wb.sheetCount})</button>`
          ]
        : []),
      ...wb.sheets.map(
        (sh, idx) =>
          `<button type="button" class="fin-wb-tab ${activeWorkbookViewKey === `sheet:${idx}` ? 'is-active' : ''}" data-wb-view="sheet:${idx}" title="${sh.name}">${sh.shortLabel || sh.name}</button>`
      )
    ].join('');

    bar.innerHTML = `
      <div class="fin-wb-meta">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
        <strong title="${wb.fileName}">${wb.title.slice(0, 28)}</strong>
        <span class="fin-wb-cur">${wb.currency}</span>
      </div>
      <div class="fin-wb-tabs" role="tablist" aria-label="Hojas del archivo Excel">${tabsHtml}</div>
      <button type="button" class="fin-wb-close" id="btnCloseWorkbookBar" title="Ocultar barra de hojas Excel" aria-label="Ocultar barra de hojas">×</button>
    `;

    bar.querySelectorAll('[data-wb-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        applyWorkbookViewToCanvas(wb, btn.dataset.wbView);
      });
    });

    bar.querySelector('#btnCloseWorkbookBar')?.addEventListener('click', () => {
      activeFinancialWorkbook = null;
      bar.hidden = true;
    });
  }

  function applyOperationsSynchronouslyToCanvas(treeResult, wbTitle) {
    if (!treeResult || !Array.isArray(treeResult.operations)) return;

    if (typeof setWorkspaceDomain === 'function') {
      setWorkspaceDomain('finance', { silent: true });
    }

    STATE.nodes = [];
    STATE.edges = [];
    STATE.sel = null;
    STATE.isBlankCanvas = false;

    const refMap = new Map();
    const addedNodes = [];

    treeResult.operations.forEach((op, idx) => {
      if (op.op === 'set_currency' && typeof window.setSheetCurrency === 'function') {
        window.setSheetCurrency(op.currency);
      } else if (op.op === 'add_node') {
        const nodeObj = createNode(op.type, op.text, 0, 0);
        if (op.note) nodeObj.note = op.note;
        if (op.params) nodeObj.params = { ...op.params };
        if (typeof ensureFinanceNodeDefaults === 'function') {
          ensureFinanceNodeDefaults(nodeObj);
        }
        STATE.nodes.push(nodeObj);
        addedNodes.push(nodeObj);
        refMap.set(op.ref || `r_${idx}`, nodeObj.id);
      } else if (op.op === 'add_edge') {
        const fromId = refMap.get(op.from);
        const toId = refMap.get(op.to);
        if (fromId && toId && fromId !== toId) {
          STATE.edges.push(createEdge(fromId, toId, op.label || '', 'normal'));
        }
      }
    });

    if (wbTitle) {
      const pTitle = document.getElementById('projTitle');
      const pTitleMob = document.getElementById('projTitleMobile');
      if (pTitle) pTitle.value = wbTitle.slice(0, 42);
      if (pTitleMob) pTitleMob.value = wbTitle.slice(0, 42);
    }

    if (typeof evaluateFinanceSheet === 'function') evaluateFinanceSheet();
    if (typeof renderNodes === 'function') renderNodes();
    if (typeof runSmartGraphLayoutEngine === 'function' && STATE.nodes.length > 0) {
      runSmartGraphLayoutEngine(STATE.nodes, STATE.edges, { mode: 'tree_lr', density: 'normal', originX: 110, originY: 74 });
    }
    if (typeof commitHistory === 'function') commitHistory();
    if (typeof renderAll === 'function') renderAll();
    if (typeof fitView === 'function' && STATE.nodes.length > 0) {
      requestAnimationFrame(() => fitView());
    }
  }

  function setActiveWorkbook(wb, viewKey = 'master') {
    activeFinancialWorkbook = wb;
    activeWorkbookViewKey = viewKey || 'master';
    renderWorkbookSheetsBar();
  }

  function applyWorkbookViewToCanvas(wb, viewKey = 'master') {
    if (!wb) return null;
    const tree = buildWorkbookTreeActions(wb, viewKey);
    if (!tree) return null;
    activeFinancialWorkbook = wb;
    activeWorkbookViewKey = tree.viewKey;
    applyOperationsSynchronouslyToCanvas(tree, `${wb.title} · ${tree.viewLabel}`);
    renderWorkbookSheetsBar();
    if (typeof showToast === 'function') {
      showToast(`${tree.viewLabel}: ${STATE.nodes.length} nodos financieros reactivos`, 'ok', 2300);
    }
    return tree;
  }

  async function importFinancialWorkbookFile(file, targetView = 'master') {
    if (!file) return null;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    let wb = null;
    if (ext === 'csv' || ext === 'tsv') {
      const txt = await file.text();
      wb = parseCsvAsWorkbook(txt, file.name);
    } else {
      const buf = await file.arrayBuffer();
      wb = await parseWorkbookFromBuffer(buf, file.name);
    }
    if (wb && wb.sheets.length > 0) {
      applyWorkbookViewToCanvas(wb, targetView);
    }
    return wb;
  }

  async function loadRepositorySampleWorkbook(applyToCanvas = true, promptOrView = 'master') {
    const resp = await fetch(REPO_SAMPLE_XLSX_URL);
    if (!resp.ok) {
      throw new Error(`No se pudo cargar ${REPO_SAMPLE_XLSX_NAME} (${resp.status})`);
    }
    const buf = await resp.arrayBuffer();
    const wb = await parseWorkbookFromBuffer(buf, REPO_SAMPLE_XLSX_NAME);
    if (applyToCanvas) {
      applyWorkbookViewToCanvas(wb, promptOrView);
    } else {
      setActiveWorkbook(wb, resolveRequestedWorkbookView(wb, promptOrView));
    }
    return wb;
  }

  function initWorkbookFinanceUI() {
    const xlsxInput = document.getElementById('finXlsxFileInput');
    const btnBarImport = document.getElementById('btnFinImportXlsx');
    const btnPalImport = document.getElementById('btnPaletteImportXlsx');
    const btnRepoSample = document.getElementById('btnFinLoadRepoXlsx');

    const openPicker = () => xlsxInput?.click();
    btnBarImport?.addEventListener('click', openPicker);
    btnPalImport?.addEventListener('click', openPicker);

    if (xlsxInput) {
      xlsxInput.addEventListener('change', async e => {
        const f = e.target.files && e.target.files[0];
        if (f) {
          try {
            await importFinancialWorkbookFile(f, 'master');
          } catch (err) {
            if (typeof showToast === 'function') {
              showToast('No se pudo analizar el archivo Excel: ' + (err.message || ''), 'err', 2600);
            }
          }
          e.target.value = '';
        }
      });
    }

    if (btnRepoSample) {
      btnRepoSample.addEventListener('click', async () => {
        const presetsDrawer = document.getElementById('finPresetsDrawer');
        if (presetsDrawer) presetsDrawer.hidden = true;
        try {
          await loadRepositorySampleWorkbook(true, 'master');
        } catch (err) {
          if (typeof showToast === 'function') {
            showToast('Error al cargar Excel familiar: ' + (err.message || ''), 'err', 2500);
          }
        }
      });
    }

    // Soportar arrastrar y soltar archivos .xlsx / .csv directamente sobre el lienzo (#viewport)
    const vp = document.getElementById('viewport');
    if (vp) {
      vp.addEventListener('dragover', e => {
        if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
          e.preventDefault();
        }
      });
      vp.addEventListener('drop', async e => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;
        const first = files[0];
        const ext = (first.name.split('.').pop() || '').toLowerCase();
        if (['xlsx', 'csv', 'tsv'].includes(ext)) {
          e.preventDefault();
          await importFinancialWorkbookFile(first, 'master');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initWorkbookFinanceUI();
  });

  window.FlowLabWorkbookEngine = {
    REPO_SAMPLE_XLSX_NAME,
    parseWorkbookFromBuffer,
    parseCsvAsWorkbook,
    formatWorkbookDigestForAI,
    buildWorkbookTreeActions,
    resolveRequestedWorkbookView,
    importFinancialWorkbookFile,
    loadRepositorySampleWorkbook,
    setActiveWorkbook,
    getActiveWorkbook: () => activeFinancialWorkbook,
    renderWorkbookSheetsBar,
    applyWorkbookViewToCanvas
  };
})();
