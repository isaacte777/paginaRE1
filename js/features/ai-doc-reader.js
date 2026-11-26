// AI DOC READER: Lector universal de imágenes y documentos (PDF, Word DOCX, Excel XLSX, PPTX,
// CSV, JSON, Markdown, HTML, RTF, Código, Imágenes Vision y cualquier archivo binario/texto)
// para armar tareas, flujos de trabajo y planillas financieras en FlowLab.

(function () {
  const MAX_TEXT_CHARS_PER_FILE = 18000;
  const MAX_IMAGE_DIM = 1280;

  function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getFileExtension(name) {
    const m = String(name || '').toLowerCase().match(/\.([a-z0-9]{1,10})$/);
    return m ? m[1] : '';
  }

  function decodeXmlEntities(str) {
    return String(str || '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code) || 32));
  }

  // =========================================================================
  // DESCOMPRESIÓN NATIVA DEFLATE / ZIP PARA DOCX, XLSX, PPTX, ODT Y PDF
  // =========================================================================
  async function inflateBytes(compressedUint8, format = 'deflate-raw') {
    if (typeof DecompressionStream === 'undefined') return null;
    try {
      const ds = new DecompressionStream(format);
      const writer = ds.writable.getWriter();
      writer.write(compressedUint8);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks = [];
      let total = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          total += value.byteLength;
          if (total > 4 * 1024 * 1024) break;
        }
      }
      const out = new Uint8Array(total);
      let offset = 0;
      chunks.forEach(c => {
        out.set(c, offset);
        offset += c.byteLength;
      });
      return out;
    } catch {
      return null;
    }
  }

  async function extractZipEntriesText(arrayBuffer, entryFilterFn) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const results = new Map();

    // Localizar End of Central Directory (PK\x05\x06)
    let eocdPos = -1;
    const minSearch = Math.max(0, bytes.length - 65558);
    for (let i = bytes.length - 22; i >= minSearch; i--) {
      if (
        bytes[i] === 0x50 &&
        bytes[i + 1] === 0x4b &&
        bytes[i + 2] === 0x05 &&
        bytes[i + 3] === 0x06
      ) {
        eocdPos = i;
        break;
      }
    }
    if (eocdPos < 0) return results;

    const totalEntries = view.getUint16(eocdPos + 10, true);
    const cdOffset = view.getUint32(eocdPos + 16, true);

    let ptr = cdOffset;
    for (let idx = 0; idx < totalEntries && ptr + 46 <= bytes.length; idx++) {
      if (view.getUint32(ptr, true) !== 0x02014b50) break;
      const compression = view.getUint16(ptr + 10, true);
      const compSize = view.getUint32(ptr + 20, true);
      const nameLen = view.getUint16(ptr + 28, true);
      const extraLen = view.getUint16(ptr + 30, true);
      const commentLen = view.getUint16(ptr + 32, true);
      const localHeaderOffset = view.getUint32(ptr + 42, true);

      const entryName = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
      ptr += 46 + nameLen + extraLen + commentLen;

      if (!entryFilterFn(entryName)) continue;
      if (localHeaderOffset + 30 > bytes.length) continue;

      const lfNameLen = view.getUint16(localHeaderOffset + 26, true);
      const lfExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + lfNameLen + lfExtraLen;
      const rawSlice = bytes.subarray(dataStart, Math.min(bytes.length, dataStart + compSize));

      let plainBytes = null;
      if (compression === 0) {
        plainBytes = rawSlice;
      } else if (compression === 8) {
        plainBytes = await inflateBytes(rawSlice, 'deflate-raw');
      }
      if (plainBytes) {
        results.set(entryName, decoder.decode(plainBytes));
      }
    }
    return results;
  }

  // Extrae texto estructurado de Word (.docx)
  async function parseDocxBuffer(arrayBuffer) {
    const entries = await extractZipEntriesText(
      arrayBuffer,
      name => name === 'word/document.xml' || name.startsWith('word/header')
    );
    const docXml = entries.get('word/document.xml') || '';
    if (!docXml) return '';

    const paragraphs = docXml
      .split(/<\/w:p>|<\/w:tr>/i)
      .map(block => {
        const texts = [];
        const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/gi;
        let m;
        while ((m = re.exec(block)) !== null) {
          texts.push(decodeXmlEntities(m[1]));
        }
        return texts.join('').trim();
      })
      .filter(Boolean);

    return paragraphs.join('\n');
  }

  // Extrae filas, columnas, valores y fórmulas reales de Excel (.xlsx)
  async function parseXlsxBuffer(arrayBuffer) {
    const entries = await extractZipEntriesText(
      arrayBuffer,
      name => name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)
    );

    const sharedStrings = [];
    const ssXml = entries.get('xl/sharedStrings.xml') || '';
    if (ssXml) {
      const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
      let sm;
      while ((sm = siRe.exec(ssXml)) !== null) {
        const tRe = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/gi;
        let tm;
        let parts = '';
        while ((tm = tRe.exec(sm[1])) !== null) parts += decodeXmlEntities(tm[1]);
        sharedStrings.push(parts.trim());
      }
    }

    const lines = [];
    const tableRows = [];
    Array.from(entries.keys())
      .filter(k => k.startsWith('xl/worksheets/'))
      .sort()
      .forEach((sheetKey, sIdx) => {
        const xml = entries.get(sheetKey) || '';
        lines.push(`=== Hoja ${sIdx + 1} ===`);
        const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/gi;
        let rm;
        while ((rm = rowRe.exec(xml)) !== null) {
          const cells = [];
          const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/gi;
          let cm;
          while ((cm = cellRe.exec(rm[1])) !== null) {
            const attrs = cm[1] || '';
            const inner = cm[2] || '';
            const refMatch = attrs.match(/\br="([A-Z]+\d+)"/i);
            const typeMatch = attrs.match(/\bt="([^"]+)"/i);
            const fMatch = inner.match(/<f(?:\s[^>]*)?>([\s\S]*?)<\/f>/i);
            const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/i);
            const isMatch = inner.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/i);

            let val = vMatch ? decodeXmlEntities(vMatch[1].trim()) : '';
            if (typeMatch && typeMatch[1] === 's') {
              val = sharedStrings[Number(val)] ?? val;
            } else if (isMatch && !val) {
              val = decodeXmlEntities(isMatch[1].trim());
            }
            const ref = refMatch ? refMatch[1] : '';
            const formula = fMatch ? '=' + decodeXmlEntities(fMatch[1].trim()) : '';
            if (val || formula) {
              cells.push({ ref, value: val, formula });
            }
          }
          if (cells.length > 0) {
            tableRows.push(cells);
            lines.push(
              cells
                .map(c => `${c.ref ? c.ref + ': ' : ''}${c.value}${c.formula ? ` (${c.formula})` : ''}`)
                .join(' | ')
            );
          }
        }
      });

    return { text: lines.join('\n'), tableRows };
  }

  // Extrae diapositivas de PowerPoint (.pptx) u OpenDocument (.odt / .ods)
  async function parseSlideOrOdfBuffer(arrayBuffer) {
    const entries = await extractZipEntriesText(
      arrayBuffer,
      name => /^ppt\/slides\/slide\d+\.xml$/i.test(name) || name === 'content.xml'
    );
    const chunks = [];
    Array.from(entries.keys())
      .sort()
      .forEach(k => {
        const xml = entries.get(k) || '';
        const re = /<(?:a:t|text:p|text:h)(?:\s[^>]*)?>([\s\S]*?)<\/(?:a:t|text:p|text:h)>/gi;
        let m;
        const slideLines = [];
        while ((m = re.exec(xml)) !== null) {
          const clean = decodeXmlEntities(m[1].replace(/<[^>]+>/g, ' ')).trim();
          if (clean) slideLines.push(clean);
        }
        if (slideLines.length) chunks.push(slideLines.join(' · '));
      });
    return chunks.join('\n');
  }

  // =========================================================================
  // EXTRACTOR DE TEXTO PDF PURO EN NAVEGADOR (STREAMS + FLATEDECODE + TJ)
  // =========================================================================
  function decodePdfLiteralString(str) {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
  }

  function decodePdfHexString(hex) {
    const clean = hex.replace(/\s+/g, '');
    if (clean.startsWith('FEFF') || clean.startsWith('feff')) {
      let out = '';
      for (let i = 4; i + 3 < clean.length; i += 4) {
        out += String.fromCharCode(parseInt(clean.slice(i, i + 4), 16));
      }
      return out;
    }
    let out = '';
    for (let i = 0; i + 1 < clean.length; i += 2) {
      const code = parseInt(clean.slice(i, i + 2), 16);
      if (code >= 32) out += String.fromCharCode(code);
    }
    return out;
  }

  function extractPdfTextOperators(contentStr) {
    const pieces = [];
    const btBlocks = contentStr.match(/BT[\s\S]*?ET/g) || [contentStr];
    btBlocks.forEach(block => {
      const lineParts = [];
      const tokenRe = /\((?:\\.|[^\\()])*\)\s*Tj|\[([\s\S]*?)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*Tj/g;
      let m;
      while ((m = tokenRe.exec(block)) !== null) {
        if (m[1] !== undefined) {
          const arrInner = m[1];
          const subRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
          let sm;
          let seg = '';
          while ((sm = subRe.exec(arrInner)) !== null) {
            seg += sm[1] !== undefined ? decodePdfLiteralString(sm[1]) : decodePdfHexString(sm[2]);
          }
          if (seg.trim()) lineParts.push(seg);
        } else if (m[2] !== undefined) {
          const hx = decodePdfHexString(m[2]);
          if (hx.trim()) lineParts.push(hx);
        } else {
          const lit = m[0].replace(/\)\s*Tj$/, '').replace(/^\(/, '');
          const dec = decodePdfLiteralString(lit);
          if (dec.trim()) lineParts.push(dec);
        }
      }
      if (lineParts.length) pieces.push(lineParts.join(' '));
    });
    return pieces.join('\n').replace(/[ \t]{2,}/g, ' ').trim();
  }

  async function parsePdfBuffer(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const latin = new TextDecoder('latin1').decode(bytes);
    const collected = [];

    // Extraer streams comprimidos y descomprimirlos con DecompressionStream('deflate')
    const streamRe = /stream\r?\n/g;
    let m;
    let streamCount = 0;
    while ((m = streamRe.exec(latin)) !== null && streamCount < 80) {
      const start = m.index + m[0].length;
      const end = latin.indexOf('endstream', start);
      if (end < 0) break;
      streamCount++;

      let trimEnd = end;
      if (latin[trimEnd - 1] === '\n') trimEnd--;
      if (latin[trimEnd - 1] === '\r') trimEnd--;

      const headerSlice = latin.slice(Math.max(0, m.index - 220), m.index);
      const rawChunk = bytes.subarray(start, trimEnd);

      if (/\/FlateDecode/i.test(headerSlice)) {
        const inflated =
          (await inflateBytes(rawChunk, 'deflate')) ||
          (await inflateBytes(rawChunk, 'deflate-raw'));
        if (inflated) {
          const decStr = new TextDecoder('latin1').decode(inflated);
          const txt = extractPdfTextOperators(decStr);
          if (txt) collected.push(txt);
        }
      } else if (!/\/Image|\/DCTDecode|\/JPXDecode/i.test(headerSlice)) {
        const rawStr = latin.slice(start, trimEnd);
        const txt = extractPdfTextOperators(rawStr);
        if (txt) collected.push(txt);
      }
    }

    if (!collected.length) {
      const direct = extractPdfTextOperators(latin);
      if (direct) collected.push(direct);
    }

    return collected.join('\n').trim();
  }

  // =========================================================================
  // PROCESAMIENTO DE IMÁGENES (VISION DATAURL + OCR DEL NAVEGADOR + REGIONES)
  // =========================================================================
  async function processImageAttachment(file) {
    const ext = getFileExtension(file.name);
    if (ext === 'svg') {
      const svgText = await file.text();
      const labels = [];
      const tRe = /<(?:text|tspan|title|desc)(?:\s[^>]*)?>([\s\S]*?)<\/(?:text|tspan|title|desc)>/gi;
      let m;
      while ((m = tRe.exec(svgText)) !== null) {
        const clean = decodeXmlEntities(m[1].replace(/<[^>]+>/g, ' ')).trim();
        if (clean) labels.push(clean);
      }
      const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText.slice(0, 120000))));
      return {
        kind: 'image',
        isVisionReady: false,
        previewUrl: dataUrl,
        dataUrl,
        mimeType: 'image/svg+xml',
        extractedText: labels.join('\n'),
        visualSummary: `Gráfico vectorial SVG con ${labels.length} etiqueta(s) de texto detectada(s).`
      };
    }

    const rawDataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ''));
      fr.onerror = () => reject(new Error('No se pudo leer la imagen'));
      fr.readAsDataURL(file);
    });

    // Redimensionar para Vision API + analizar estructura visual y OCR nativo si el navegador soporta TextDetector
    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = rawDataUrl;
      });

      const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width || 1, img.height || 1));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const compactDataUrl = canvas.toDataURL('image/jpeg', 0.84);
      let ocrLines = [];

      if (typeof window.TextDetector === 'function') {
        try {
          const detector = new window.TextDetector();
          const detected = await detector.detect(canvas);
          if (Array.isArray(detected) && detected.length > 0) {
            ocrLines = detected
              .slice()
              .sort((a, b) => (a.boundingBox?.y || 0) - (b.boundingBox?.y || 0))
              .map(d => String(d.rawValue || '').trim())
              .filter(Boolean);
          }
        } catch {}
      }

      // Estimar bandas visuales horizontales/verticales para entender la proporción del diagrama/documento
      const orient = w > h * 1.28 ? 'apaisada / horizontal' : h > w * 1.22 ? 'vertical / documento' : 'cuadrada';

      return {
        kind: 'image',
        isVisionReady: true,
        previewUrl: compactDataUrl,
        dataUrl: compactDataUrl,
        mimeType: 'image/jpeg',
        width: img.width,
        height: img.height,
        extractedText: ocrLines.join('\n'),
        visualSummary: `Imagen (${img.width}×${img.height}px, disposición ${orient})${
          ocrLines.length ? ` · ${ocrLines.length} bloque(s) de texto detectados por OCR` : ''
        }`
      };
    } catch {
      return {
        kind: 'image',
        isVisionReady: true,
        previewUrl: rawDataUrl,
        dataUrl: rawDataUrl,
        mimeType: file.type || 'image/png',
        extractedText: '',
        visualSummary: `Imagen adjunta (${formatBytes(file.size)})`
      };
    }
  }

  // =========================================================================
  // LECTOR UNIVERSAL DE CUALQUIER ARCHIVO ADJUNTO
  // =========================================================================
  function stripHtmlOrRtf(raw, ext) {
    if (ext === 'html' || ext === 'htm') {
      return decodeXmlEntities(
        raw
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, '\n')
          .replace(/<[^>]+>/g, ' ')
      )
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    }
    if (ext === 'rtf') {
      return raw
        .replace(/\\par[d]?/g, '\n')
        .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
        .replace(/\\[a-zA-Z]+-?\d*\s?/g, '')
        .replace(/[{}]/g, '')
        .trim();
    }
    return raw;
  }

  function extractPrintableFallback(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 120000));
    const matches = utf8.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_.,:;/$%()\-+=#@?! ]{5,}/g) || [];
    return matches.slice(0, 260).join('\n').trim();
  }

  async function readAnyUserAttachment(file) {
    const name = file.name || 'archivo_adjunto';
    const ext = getFileExtension(name);
    const mime = (file.type || '').toLowerCase();
    const sizeLabel = formatBytes(file.size);

    // 1. Imágenes (PNG, JPG, WEBP, GIF, BMP, SVG)
    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
      const imgData = await processImageAttachment(file);
      return {
        id: 'att_' + Math.random().toString(36).slice(2, 9),
        name,
        ext: ext || 'img',
        sizeLabel,
        isImage: true,
        visionDataUrl: imgData.isVisionReady ? imgData.dataUrl : '',
        summarySnippet: imgData.visualSummary,
        dimensions: imgData.width && imgData.height ? { width: imgData.width, height: imgData.height } : null,
        ...imgData
      };
    }

    const buffer = await file.arrayBuffer();
    let extractedText = '';
    let structuredRows = null;
    let docKindLabel = ext ? `.${ext}` : 'documento';

    // 2. Documentos PDF
    if (ext === 'pdf' || mime === 'application/pdf') {
      docKindLabel = 'PDF';
      extractedText = await parsePdfBuffer(buffer);
      if (!extractedText) extractedText = extractPrintableFallback(buffer);
    }
    // 3. Word (.docx)
    else if (ext === 'docx' || mime.includes('wordprocessingml')) {
      docKindLabel = 'Word DOCX';
      extractedText = await parseDocxBuffer(buffer);
    }
    // 4. Excel (.xlsx)
    else if (ext === 'xlsx' || mime.includes('spreadsheetml')) {
      docKindLabel = 'Excel XLSX';
      const parsedXls = await parseXlsxBuffer(buffer);
      extractedText = parsedXls.text;
      structuredRows = parsedXls.tableRows;
    }
    // 5. PowerPoint / OpenDocument (.pptx, .odt, .ods)
    else if (['pptx', 'odt', 'ods'].includes(ext) || mime.includes('presentationml') || mime.includes('opendocument')) {
      docKindLabel = ext.toUpperCase();
      extractedText = await parseSlideOrOdfBuffer(buffer);
    }
    // 6. Archivos de texto, código, CSV, JSON, Markdown, XML, SQL, HTML, RTF o desconocidos
    else {
      const rawTxt = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      const nonPrintableRatio =
        rawTxt.length > 0
          ? (rawTxt.slice(0, 2000).match(/[\x00-\x08\x0E-\x1F]/g) || []).length / Math.min(2000, rawTxt.length)
          : 0;

      if (nonPrintableRatio > 0.12) {
        docKindLabel = ext ? `Binario .${ext}` : 'Archivo';
        extractedText = extractPrintableFallback(buffer);
      } else {
        docKindLabel = ext ? ext.toUpperCase() : 'Texto';
        extractedText = stripHtmlOrRtf(rawTxt, ext);
      }
    }

    const trimmed = String(extractedText || '').trim().slice(0, MAX_TEXT_CHARS_PER_FILE);
    const lineCount = trimmed ? trimmed.split(/\r?\n/).filter(Boolean).length : 0;

    return {
      id: 'att_' + Math.random().toString(36).slice(2, 9),
      kind: ext || 'doc',
      isImage: false,
      isVisionReady: false,
      visionDataUrl: '',
      name,
      ext: ext || 'doc',
      docKindLabel,
      sizeLabel,
      mimeType: mime || 'application/octet-stream',
      extractedText: trimmed,
      structuredRows,
      summarySnippet: `${docKindLabel} (${sizeLabel})${lineCount ? ` · ${lineCount} línea(s) leídas` : ''}`,
      visualSummary: `${docKindLabel} (${sizeLabel})${lineCount ? ` · ${lineCount} línea(s) leídas` : ''}`
    };
  }

  // =========================================================================
  // GENERADOR INTELIGENTE DE TAREAS / FLUJO / PLANILLA DESDE DOCUMENTOS E IMÁGENES
  // =========================================================================
  function parseMoneyAmount(str) {
    const m = String(str || '').match(/-?[$₲€]?\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:\.\d+)?)\s*(%|k|m)?/i);
    if (!m) return null;
    let raw = m[1];
    // Si tiene formato 12,500.00 o 12.500
    if (/^\d{1,3}(\.\d{3})+$/.test(raw)) raw = raw.replace(/\./g, '');
    else raw = raw.replace(/,/g, '');
    let num = parseFloat(raw);
    if (Number.isNaN(num)) return null;
    const suf = (m[2] || '').toLowerCase();
    if (suf === 'k') num *= 1000;
    if (suf === 'm') num *= 1000000;
    return { value: num, isPct: suf === '%' };
  }

  function classifyTaskTypeFromLine(line, idx, total) {
    const s = line
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (line.includes('?') || /\b(si |validar|aprobar|cumple|existe|verificar|decision|condicion)\b/.test(s)) {
      return 'decision';
    }
    if (/\b(base de datos|bd|sql|guardar|almacenar|tabla|registro|inventario)\b/.test(s)) return 'db';
    if (/\b(api|endpoint|http|webhook|servicio|integracion|pasarela)\b/.test(s)) return 'api';
    if (/\b(ia|llm|modelo|clasificar|ocr|agente|automatizar)\b/.test(s)) return 'ai';
    if (/\b(cliente|usuario|equipo|responsable|revision|manual|firma|entrevista)\b/.test(s)) return 'human';
    if (/\b(recibir|entrada|formulario|archivo|documento|carga|solicitud)\b/.test(s)) return 'io';
    if (/\b(error|fallo|rechazo|alerta|incidencia)\b/.test(s)) return 'err';
    if (idx === 0) return 'start';
    if (idx === total - 1 && total >= 3) return 'end';
    return 'process';
  }

  function inferFinanceTypeFromLabel(label) {
    const s = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (/\b(ingreso|venta|facturacion|cobro)\b/.test(s)) return 'fin_revenue';
    if (/\b(costo directo|cogs|mercaderia|insumo)\b/.test(s)) return 'fin_cogs';
    if (/\b(gasto|opex|alquiler|marketing|servicio|administrativ)\b/.test(s)) return 'fin_opex';
    if (/\b(nomina|salario|sueldo|personal)\b/.test(s)) return 'fin_payroll_cost';
    if (/\b(impuesto|iva|renta|tasa fiscal)\b/.test(s)) return 'fin_tax';
    if (/\b(inversion|capex|activo|maquinaria)\b/.test(s)) return 'fin_capex';
    if (/\b(tasa|interes|descuento)\b/.test(s)) return 'fin_rate';
    if (/\b(cantidad|unidades|volumen)\b/.test(s)) return 'fin_qty';
    if (/\b(precio)\b/.test(s)) return 'fin_unit_price';
    return 'fin_input';
  }

  /**
   * Construye un bloque estructurado de contexto documental para inyectar al LLM externo
   */
  function formatAttachmentsForPrompt(attachments) {
    if (!Array.isArray(attachments) || !attachments.length) return '';
    const sections = attachments.map((att, idx) => {
      const header = `[ARCHIVO ADJUNTO ${idx + 1}: "${att.name}" — ${att.visualSummary || att.sizeLabel}]`;
      if (att.extractedText && att.extractedText.trim()) {
        return `${header}\nCONTENIDO EXTRAÍDO:\n${att.extractedText.trim()}`;
      }
      if (att.kind === 'image') {
        return `${header}\n(Imagen adjunta lista para análisis visual multimodal: extrae todos los pasos, tareas, actores, relaciones o cifras visibles y conviértelos en nodos conectados en el lienzo.)`;
      }
      return `${header}\n(Archivo adjunto procesado. Estructura el trabajo solicitado a partir de su nombre y propósito.)`;
    });
    return '\n\n=== DOCUMENTOS E IMÁGENES ADJUNTOS POR EL USUARIO ===\n' + sections.join('\n\n');
  }

  /**
   * Sintetiza directamente operaciones `flowlab-actions` a partir de documentos/imágenes leídos
   * (usado en Modo Integrado o como respaldo garantizado si un modelo externo responde solo en texto).
   */
  function synthesizeActionsFromDocuments(attachments, userPrompt = '', llmReplyText = '') {
    const combinedRaw = [
      ...(attachments || []).map(a => a.extractedText || ''),
      llmReplyText || ''
    ]
      .join('\n')
      .trim();

    const promptNorm = String(userPrompt || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const wantsClear = /\b(desde cero|reemplaza|limpia|nuevo lienzo)\b/.test(promptNorm);
    const prefixOps = wantsClear ? [{ op: 'clear_canvas' }] : [];

    // 1. Verificar si es un documento predominantemente financiero / Excel / CSV con montos
    const lines = combinedRaw
      .split(/\r?\n/)
      .map(l => l.replace(/^[\s•\-*>\d.)[\]✓xX]+/, '').trim())
      .filter(l => l.length >= 3 && l.length <= 140);

    const finCandidates = [];
    // Aprovechar primero filas estructuradas de Excel (.xlsx) si están presentes
    (attachments || []).forEach(att => {
      if (Array.isArray(att.structuredRows)) {
        att.structuredRows.forEach(rowCells => {
          if (!Array.isArray(rowCells) || rowCells.length < 2) return;
          const labelPart = String(rowCells[0]?.value || '').trim().slice(0, 34);
          const amt = parseMoneyAmount(rowCells.slice(1).map(c => c.value).join(' '));
          if (labelPart && !/^(rubro|concepto|item|partida|descripcion)$/i.test(labelPart) && amt && amt.value > 0) {
            finCandidates.push({
              label: labelPart,
              value: amt.value,
              isPct: amt.isPct,
              type: amt.isPct ? 'fin_rate' : inferFinanceTypeFromLabel(labelPart)
            });
          }
        });
      }
    });

    if (finCandidates.length === 0) {
      lines.forEach(line => {
        // Ignorar líneas de sintaxis markdown o metadatos
        if (/^(```|http|===|\[archivo)/i.test(line)) return;
        const cleanedCells = line.replace(/\b[A-Z]{1,2}\d{1,3}:\s*/g, '');
        const sepRe = /[|;\t]/.test(cleanedCells) ? /[|;\t]/ : /:/;
        const parts = cleanedCells.split(sepRe).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const labelPart = parts[0].replace(/^A\d+\s*/i, '').slice(0, 34);
          const amt = parseMoneyAmount(parts.slice(1).join(' '));
          if (labelPart && amt && amt.value > 0) {
            finCandidates.push({
              label: labelPart,
              value: amt.value,
              isPct: amt.isPct,
              type: amt.isPct ? 'fin_rate' : inferFinanceTypeFromLabel(labelPart)
            });
          }
        }
      });
    }

    const wantsFinanceExplicit =
      /\b(planilla|finanza\w*|presupuesto|estado de resultados|flujo de caja|excel|costo\w*|ingreso\w*|gasto\w*)\b/.test(
        promptNorm
      ) ||
      (attachments || []).some(a => a.ext === 'xlsx' || a.ext === 'csv');

    const wantsTasksToo =
      /\b(tarea\w*|flujo\s+y\s+finanza\w*|trabajo|operativ\w*|proceso\w*|procedimiento)\b/.test(promptNorm) ||
      (attachments || []).some(a => ['pdf', 'docx', 'pptx', 'md', 'txt', 'svg', 'png', 'jpg', 'jpeg'].includes(a.ext));

    if (finCandidates.length >= 3 && !wantsTasksToo && (wantsFinanceExplicit || finCandidates.length >= lines.length * 0.45)) {
      const selectedFin = finCandidates.slice(0, 10);
      const ops = [...prefixOps];
      const inRefs = [];
      const outRefs = [];

      selectedFin.forEach((fc, idx) => {
        const ref = `f_${idx + 1}`;
        const cellRef = `A${idx + 1}`;
        ops.push({
          op: 'add_node',
          ref,
          type: fc.type,
          text: fc.label,
          params: {
            cellRef,
            value: fc.value,
            format: fc.isPct ? 'percent' : 'currency'
          }
        });
        if (['fin_cogs', 'fin_opex', 'fin_tax', 'fin_capex', 'fin_payroll_cost'].includes(fc.type)) {
          outRefs.push(ref);
        } else if (!fc.isPct) {
          inRefs.push(ref);
        }
      });

      ops.push({
        op: 'add_node',
        ref: 'f_total_in',
        type: 'fin_sum',
        text: 'Total Entradas / Base',
        params: { cellRef: 'B1', format: 'currency' }
      });
      inRefs.forEach(r => ops.push({ op: 'add_edge', from: r, to: 'f_total_in', label: '+' }));

      if (outRefs.length > 0) {
        ops.push({
          op: 'add_node',
          ref: 'f_total_out',
          type: 'fin_sum',
          text: 'Total Costos y Egresos',
          params: { cellRef: 'B2', format: 'currency' }
        });
        outRefs.forEach(r => ops.push({ op: 'add_edge', from: r, to: 'f_total_out', label: '+' }));

        ops.push({
          op: 'add_node',
          ref: 'f_net',
          type: 'fin_net_income',
          text: 'Resultado Neto Calculado',
          params: { cellRef: 'C1', format: 'currency' }
        });
        ops.push({ op: 'add_edge', from: 'f_total_in', to: 'f_net', label: '+' });
        ops.push({ op: 'add_edge', from: 'f_total_out', to: 'f_net', label: '-' });
      }

      const summary = `Planilla financiera armada desde documento (${ops.filter(o => o.op === 'add_node').length} celdas)`;
      return {
        summary,
        operations: ops,
        actions: { summary, operations: ops },
        extractedCount: selectedFin.length,
        domain: 'finance'
      };
    }

    // 2. Extracción general de tareas, etapas o pasos operativos (excluyendo filas puramente numéricas de tabla Excel)
    let taskLines = lines
      .map(l => l.replace(/\*\*/g, '').replace(/`/g, '').trim())
      .filter(l => !/\|.*\d{3,}/.test(l) && !/^\[hoja/i.test(l) && !/^rubro\s*\|/i.test(l) && !/^concepto\s*\|/i.test(l))
      .filter(
        l =>
          l.length >= 4 &&
          !/^(estoy preparado|he generado|resumen|documentos adjuntos|contenido extraido)/i.test(l)
      );

    // Si es una imagen sin texto OCR en modo offline, estructurar flujo de trabajo basado en el archivo + instrucción
    if (!taskLines.length && (attachments || []).length > 0) {
      const firstAtt = attachments[0];
      const baseTitle = firstAtt.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Documento';
      taskLines = [
        `Recepción: ${baseTitle.slice(0, 26)}`,
        'Extracción y lectura de datos clave',
        '¿Información completa y validada?',
        'Ejecución de tareas principales',
        'Registro de entregables y control',
        'Trabajo completado'
      ];
    }

    // Seleccionar entre 4 y 12 tareas claras y concisas
    const uniqueTasks = [];
    const seenNorm = new Set();
    for (const tl of taskLines) {
      const short = tl.split(/[.:—–]/)[0].trim().slice(0, 42);
      const key = short.toLowerCase();
      if (short.length < 4 || seenNorm.has(key)) continue;
      seenNorm.add(key);
      uniqueTasks.push(short);
      if (uniqueTasks.length >= 11) break;
    }

    if (uniqueTasks.length < 2) return null;

    const ops = [...prefixOps];
    const hasStart = /\b(inicio|recepcion|entrada)\b/i.test(uniqueTasks[0]);
    const hasEnd = /\b(fin|cierre|completad|entregad)\b/i.test(uniqueTasks[uniqueTasks.length - 1]);

    const finalSteps = [
      ...(hasStart ? [] : [`Inicio: ${(attachments?.[0]?.name || 'Proyecto').slice(0, 22)}`]),
      ...uniqueTasks,
      ...(hasEnd ? [] : ['Cierre y entrega final'])
    ].slice(0, 12);

    let prevRef = null;
    finalSteps.forEach((stepTxt, idx) => {
      const ref = `doc_${idx + 1}`;
      const nType = classifyTaskTypeFromLine(stepTxt, idx, finalSteps.length);
      ops.push({
        op: 'add_node',
        ref,
        type: nType,
        text: stepTxt
      });
      if (prevRef) {
        const prevOp = ops.find(o => o.ref === prevRef);
        const edgeLbl = prevOp && prevOp.type === 'decision' ? 'Sí' : '';
        ops.push({ op: 'add_edge', from: prevRef, to: ref, label: edgeLbl });

        // Si hubo decisión, añadir una rama limpia de revisión/ajuste para realismo arquitectónico
        if (prevOp && prevOp.type === 'decision') {
          const revRef = `rev_${idx}`;
          ops.push({
            op: 'add_node',
            ref: revRef,
            type: 'human',
            text: 'Corregir / completar observaciones'
          });
          ops.push({ op: 'add_edge', from: prevRef, to: revRef, label: 'No' });
          ops.push({ op: 'add_edge', from: revRef, to: ref, label: 'OK' });
        }
      }
      prevRef = ref;
    });

    // Si además se detectaron partidas financieras en los archivos adjuntos, construir el bloque financiero completo y enlazar puente Flujo ⇄ Finanzas!
    let finalDomain = 'workflow';
    if (finCandidates.length >= 1) {
      finalDomain = finCandidates.length >= 2 ? 'hybrid' : 'workflow';
      const selectedFin = finCandidates.slice(0, 6);
      const inRefs = [];
      const outRefs = [];
      selectedFin.forEach((fc, idx) => {
        const ref = `doc_fin_${idx + 1}`;
        ops.push({
          op: 'add_node',
          ref,
          type: fc.type || 'fin_revenue',
          text: fc.label,
          params: { cellRef: `A${idx + 1}`, value: fc.value, format: fc.isPct ? 'percent' : 'currency' }
        });
        if (idx === 0) {
          ops.push({ op: 'add_edge', from: prevRef, to: ref, label: 'flujo→fx' });
        }
        if (['fin_cogs', 'fin_opex', 'fin_tax', 'fin_capex', 'fin_payroll_cost'].includes(fc.type)) {
          outRefs.push(ref);
        } else if (!fc.isPct) {
          inRefs.push(ref);
        }
      });

      if (selectedFin.length >= 2) {
        ops.push({
          op: 'add_node',
          ref: 'doc_fin_net',
          type: 'fin_net_income',
          text: 'Resultado Neto Proyecto',
          params: { cellRef: 'B1', format: 'currency' }
        });
        inRefs.forEach(r => ops.push({ op: 'add_edge', from: r, to: 'doc_fin_net', label: '+' }));
        outRefs.forEach(r => ops.push({ op: 'add_edge', from: r, to: 'doc_fin_net', label: '-' }));
      }
    }

    const summary =
      finalDomain === 'hybrid'
        ? `Flujo de tareas + Planilla fx armados desde documentos (${ops.filter(o => o.op === 'add_node').length} nodos)`
        : `Flujo de trabajo armado desde documento (${ops.filter(o => o.op === 'add_node').length} tareas)`;

    return {
      summary,
      operations: ops,
      actions: { summary, operations: ops },
      extractedCount: finalSteps.length + finCandidates.length,
      domain: finalDomain
    };
  }

  window.readAnyUserAttachment = readAnyUserAttachment;
  window.formatAttachmentsForPrompt = formatAttachmentsForPrompt;
  window.synthesizeActionsFromDocuments = synthesizeActionsFromDocuments;
})();
