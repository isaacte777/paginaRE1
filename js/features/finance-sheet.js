// FINANCE SHEET: Motor de Planilla Financiera tipo Excel (54 nodos financieros, evaluador reactivo DAG, barra fx y métricas propias)

(function () {
  const CURRENCY_CONFIG = {
    USD: { symbol: '$', decimals: 2, code: 'USD' },
    PYG: { symbol: '₲ ', decimals: 0, code: 'PYG' },
    EUR: { symbol: '€', decimals: 2, code: 'EUR' },
    ARS: { symbol: '$', decimals: 2, code: 'ARS' },
    BRL: { symbol: 'R$', decimals: 2, code: 'BRL' }
  };

  const FIN_SVGS = {
    cell: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="22" height="14" rx="2"/><line x1="8" y1="1" x2="8" y2="15"/><line x1="1" y1="8" x2="23" y2="8"/></svg>',
    fx: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14l4-12h3"/><line x1="3" y1="8" x2="9" y2="8"/><line x1="14" y1="6" x2="21" y2="13"/><line x1="21" y1="6" x2="14" y2="13"/></svg>',
    sum: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="19,2 5,2 13,8 5,14 19,14"/></svg>',
    pnl: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="14" x2="22" y2="14"/><rect x="4" y="7" width="4" height="7"/><rect x="10" y="3" width="4" height="11"/><rect x="16" y="5" width="4" height="9"/></svg>',
    cash: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="2" width="22" height="12" rx="2"/><circle cx="12" cy="8" r="3"/></svg>',
    inv: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2,13 8,8 13,10 21,3"/><polyline points="16,3 21,3 21,8"/></svg>',
    loan: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9-5 9 5"/><line x1="5" y1="7" x2="5" y2="14"/><line x1="12" y1="7" x2="12" y2="14"/><line x1="19" y1="7" x2="19" y2="14"/><line x1="2" y1="14" x2="22" y2="14"/></svg>',
    ratio: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="14" x2="19" y2="2"/><circle cx="6.5" cy="4.5" r="2"/><circle cx="17.5" cy="11.5" r="2"/></svg>',
    comm: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2h9l9 8-8 5-10-8V2z"/><circle cx="7.5" cy="6" r="1.3"/></svg>'
  };

  const FINANCE_CATEGORIES = [
    { id: 'entradas', label: 'celdas y datos base', icon: FIN_SVGS.cell },
    { id: 'excel', label: 'fórmulas excel', icon: FIN_SVGS.sum },
    { id: 'resultados', label: 'estado resultados (p&l)', icon: FIN_SVGS.pnl },
    { id: 'flujo_caja', label: 'flujo de caja y liquidez', icon: FIN_SVGS.cash },
    { id: 'inversion', label: 'inversión (van · tir · roi)', icon: FIN_SVGS.inv },
    { id: 'credito', label: 'préstamos y amortización', icon: FIN_SVGS.loan },
    { id: 'ratios', label: 'ratios y equilibrio', icon: FIN_SVGS.ratio },
    { id: 'comercial', label: 'impuestos, precios y nómina', icon: FIN_SVGS.comm }
  ];

  // 54 Nodos Financieros con lógica real de hoja de cálculo
  const FINANCE_NODE_LIST = [
    // 1. CELDAS Y DATOS BASE (7)
    { type: 'fin_input', cat: 'entradas', fn: 'celda_valor()', title: 'Celda de Valor', format: 'currency', tone: 'input', defaultVal: 10000, fxHint: 'Valor base' },
    { type: 'fin_rate', cat: 'entradas', fn: 'tasa_porcentaje()', title: 'Tasa / Interés (%)', format: 'percent', tone: 'input', defaultVal: 12, fxHint: 'Tasa %' },
    { type: 'fin_periods', cat: 'entradas', fn: 'periodos_plazo()', title: 'Plazo / Periodos', format: 'number', tone: 'input', defaultVal: 12, fxHint: 'Nper' },
    { type: 'fin_qty', cat: 'entradas', fn: 'cantidad_unidades()', title: 'Cantidad / Unidades', format: 'number', tone: 'input', defaultVal: 250, fxHint: 'Volumen Q' },
    { type: 'fin_unit_price', cat: 'entradas', fn: 'precio_unitario()', title: 'Precio Unitario', format: 'currency', tone: 'input', defaultVal: 120, fxHint: 'Precio P' },
    { type: 'fin_fx_rate', cat: 'entradas', fn: 'tipo_cambio()', title: 'Conversión Divisa', format: 'currency', tone: 'formula', defaultVal: 1, rateParam: 7500, fxHint: '=Monto × TC' },
    { type: 'fin_formula', cat: 'entradas', fn: 'formula_excel()', title: 'Fórmula Libre Excel', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=SUMA(entradas)' },

    // 2. FÓRMULAS HOJA EXCEL (8)
    { type: 'fin_sum', cat: 'excel', fn: 'suma_rango()', title: 'SUMA Total', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=SUMA(rango)' },
    { type: 'fin_subtract', cat: 'excel', fn: 'resta_diferencia()', title: 'Resta / Diferencia', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=A - B' },
    { type: 'fin_multiply', cat: 'excel', fn: 'producto_mult()', title: 'PRODUCTO (×)', format: 'currency', tone: 'formula', defaultVal: 1, fxHint: '=PRODUCTO(A;B)' },
    { type: 'fin_divide', cat: 'excel', fn: 'division_ratio()', title: 'División / Cociente', format: 'number', tone: 'formula', defaultVal: 0, fxHint: '=A / B' },
    { type: 'fin_average', cat: 'excel', fn: 'promedio_media()', title: 'PROMEDIO', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=PROMEDIO(rango)' },
    { type: 'fin_min_max', cat: 'excel', fn: 'min_max_rango()', title: 'MÁX / MÍN Rango', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=MAX(rango)' },
    { type: 'fin_if_cond', cat: 'excel', fn: 'si_condicional()', title: 'Condicional SI()', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=SI(A>=Meta)' },
    { type: 'fin_variance_pct', cat: 'excel', fn: 'variacion_pct()', title: 'Variación Δ%', format: 'percent', tone: 'ratio', defaultVal: 0, fxHint: '=(Act-Base)/Base' },

    // 3. ESTADO DE RESULTADOS P&L (9)
    { type: 'fin_revenue', cat: 'resultados', fn: 'ingresos_ventas()', title: 'Ingresos por Ventas', format: 'currency', tone: 'positive', defaultVal: 85000, fxHint: '=Ventas Brutas' },
    { type: 'fin_cogs', cat: 'resultados', fn: 'costo_ventas()', title: 'Costo de Ventas (COGS)', format: 'currency', tone: 'negative', defaultVal: 32000, fxHint: '=Costo Directo' },
    { type: 'fin_gross_profit', cat: 'resultados', fn: 'utilidad_bruta()', title: 'Utilidad Bruta', format: 'currency', tone: 'positive', defaultVal: 53000, fxHint: '=Ingresos - COGS' },
    { type: 'fin_opex', cat: 'resultados', fn: 'gastos_operativos()', title: 'Gastos Operativos (OPEX)', format: 'currency', tone: 'negative', defaultVal: 18500, fxHint: '=Gastos Fijos' },
    { type: 'fin_ebitda', cat: 'resultados', fn: 'ebitda()', title: 'EBITDA', format: 'currency', tone: 'positive', defaultVal: 34500, fxHint: '=U.Bruta - OPEX' },
    { type: 'fin_depreciation', cat: 'resultados', fn: 'depreciacion_amort()', title: 'Depreciación (D&A)', format: 'currency', tone: 'negative', defaultVal: 3500, fxHint: '=(Activo-Res)/Vida' },
    { type: 'fin_ebit', cat: 'resultados', fn: 'ebit_operativo()', title: 'EBIT Operativo', format: 'currency', tone: 'positive', defaultVal: 31000, fxHint: '=EBITDA - D&A' },
    { type: 'fin_tax', cat: 'resultados', fn: 'impuesto_renta()', title: 'Impuesto a la Renta', format: 'currency', tone: 'negative', defaultVal: 3100, rateParam: 10, fxHint: '=Base × Tasa%' },
    { type: 'fin_net_income', cat: 'resultados', fn: 'utilidad_neta()', title: 'Utilidad Neta', format: 'currency', tone: 'positive', defaultVal: 27900, fxHint: '=EBIT - Impuestos' },

    // 4. FLUJO DE CAJA Y TESORERÍA (6)
    { type: 'fin_cash_in', cat: 'flujo_caja', fn: 'cobros_entradas()', title: 'Cobros de Caja', format: 'currency', tone: 'positive', defaultVal: 64000, fxHint: '=Entradas Caja' },
    { type: 'fin_cash_out', cat: 'flujo_caja', fn: 'pagos_salidas()', title: 'Pagos de Caja', format: 'currency', tone: 'negative', defaultVal: 41000, fxHint: '=Salidas Caja' },
    { type: 'fin_ocf', cat: 'flujo_caja', fn: 'flujo_operativo()', title: 'Flujo Operativo (OCF)', format: 'currency', tone: 'positive', defaultVal: 23000, fxHint: '=Cobros - Pagos' },
    { type: 'fin_capex', cat: 'flujo_caja', fn: 'inversion_capex()', title: 'Inversión CAPEX', format: 'currency', tone: 'negative', defaultVal: 8000, fxHint: '=Activo Fijo' },
    { type: 'fin_fcf', cat: 'flujo_caja', fn: 'flujo_caja_libre()', title: 'Free Cash Flow (FCF)', format: 'currency', tone: 'positive', defaultVal: 15000, fxHint: '=OCF - CAPEX' },
    { type: 'fin_working_cap', cat: 'flujo_caja', fn: 'capital_trabajo()', title: 'Capital de Trabajo', format: 'currency', tone: 'formula', defaultVal: 19000, fxHint: '=Act.Cte - Pas.Cte' },

    // 5. INVERSIÓN Y VALOR EN EL TIEMPO (7)
    { type: 'fin_npv', cat: 'inversion', fn: 'van_vpn()', title: 'VAN / VPN', format: 'currency', tone: 'positive', defaultVal: 14250, rateParam: 12, fxHint: '=VNA(r; flujos)-I0' },
    { type: 'fin_irr', cat: 'inversion', fn: 'tir_retorno()', title: 'TIR (%)', format: 'percent', tone: 'ratio', defaultVal: 22.4, fxHint: '=TIR(flujos)' },
    { type: 'fin_roi', cat: 'inversion', fn: 'retorno_roi()', title: 'Retorno ROI (%)', format: 'percent', tone: 'ratio', defaultVal: 38.5, fxHint: '=(Gan-Inv)/Inv' },
    { type: 'fin_payback', cat: 'inversion', fn: 'periodo_recupero()', title: 'Payback (Recupero)', format: 'months', tone: 'ratio', defaultVal: 2.4, fxHint: '=Inv / Flujo' },
    { type: 'fin_pv', cat: 'inversion', fn: 'valor_presente()', title: 'Valor Presente VA()', format: 'currency', tone: 'formula', defaultVal: 44642.86, rateParam: 12, nperParam: 1, fxHint: '=VA(r; n; vf)' },
    { type: 'fin_fv', cat: 'inversion', fn: 'valor_futuro()', title: 'Valor Futuro VF()', format: 'currency', tone: 'positive', defaultVal: 56000, rateParam: 12, nperParam: 1, fxHint: '=VF(r; n; va)' },
    { type: 'fin_cagr', cat: 'inversion', fn: 'tasa_cagr()', title: 'Crecimiento CAGR (%)', format: 'percent', tone: 'ratio', defaultVal: 15.8, nperParam: 3, fxHint: '=(Vf/Vi)^(1/n)-1' },

    // 6. CRÉDITOS, DEUDA Y AMORTIZACIÓN (6)
    { type: 'fin_pmt', cat: 'credito', fn: 'cuota_pago()', title: 'Cuota Fija PAGO()', format: 'currency', tone: 'negative', defaultVal: 1112.22, rateParam: 12, nperParam: 36, fxHint: '=PAGO(r/12; n; M)' },
    { type: 'fin_ipmt', cat: 'credito', fn: 'pago_interes()', title: 'Interés Periodo PAGOINT', format: 'currency', tone: 'negative', defaultVal: 334.67, rateParam: 12, nperParam: 36, perParam: 1, fxHint: '=PAGOINT(r;p;n;M)' },
    { type: 'fin_ppmt', cat: 'credito', fn: 'pago_capital()', title: 'Capital Periodo PAGOPRIN', format: 'currency', tone: 'formula', defaultVal: 777.55, rateParam: 12, nperParam: 36, perParam: 1, fxHint: '=PAGOPRIN(r;p;n;M)' },
    { type: 'fin_loan_balance', cat: 'credito', fn: 'saldo_insoluto()', title: 'Saldo Insoluto Deuda', format: 'currency', tone: 'negative', defaultVal: 24500, rateParam: 12, nperParam: 36, perParam: 12, fxHint: '=Saldo tras k cuotas' },
    { type: 'fin_compound_int', cat: 'credito', fn: 'interes_compuesto()', title: 'Interés Compuesto', format: 'currency', tone: 'positive', defaultVal: 4049.28, rateParam: 12, nperParam: 3, fxHint: '=C×((1+r)^n - 1)' },
    { type: 'fin_dscr', cat: 'credito', fn: 'cobertura_deuda()', title: 'Cobertura DSCR (x)', format: 'multiple', tone: 'ratio', defaultVal: 1.85, fxHint: '=FlujoOp / Deuda' },

    // 7. RATIOS Y EQUILIBRIO (6)
    { type: 'fin_gross_margin', cat: 'ratios', fn: 'margen_bruto_pct()', title: 'Margen Bruto (%)', format: 'percent', tone: 'ratio', defaultVal: 62.35, fxHint: '=U.Bruta / Ventas' },
    { type: 'fin_net_margin', cat: 'ratios', fn: 'margen_neto_pct()', title: 'Margen Neto (%)', format: 'percent', tone: 'ratio', defaultVal: 32.82, fxHint: '=U.Neta / Ventas' },
    { type: 'fin_roe', cat: 'ratios', fn: 'rentabilidad_roe()', title: 'Rentabilidad ROE (%)', format: 'percent', tone: 'ratio', defaultVal: 24.5, fxHint: '=U.Neta / Patrim.' },
    { type: 'fin_roa', cat: 'ratios', fn: 'rentabilidad_roa()', title: 'Rentabilidad ROA (%)', format: 'percent', tone: 'ratio', defaultVal: 14.2, fxHint: '=U.Neta / Activos' },
    { type: 'fin_breakeven', cat: 'ratios', fn: 'punto_equilibrio()', title: 'Punto de Equilibrio (Q*)', format: 'number', tone: 'ratio', defaultVal: 310, fxHint: '=CF / (P - CVu)' },
    { type: 'fin_liquidity', cat: 'ratios', fn: 'liquidez_corriente()', title: 'Liquidez Corriente (x)', format: 'multiple', tone: 'ratio', defaultVal: 1.92, fxHint: '=Act.Cte / Pas.Cte' },

    // 8. IMPUESTOS COMERCIALES, PRECIOS Y NÓMINA (5)
    { type: 'fin_vat_iva', cat: 'comercial', fn: 'calculo_iva()', title: 'Cálculo de IVA', format: 'currency', tone: 'formula', defaultVal: 1000, rateParam: 10, fxHint: '=Base × IVA%' },
    { type: 'fin_markup_price', cat: 'comercial', fn: 'precio_con_margen()', title: 'Precio con Margen Obj.', format: 'currency', tone: 'positive', defaultVal: 150, rateParam: 35, fxHint: '=Costo / (1-Mg%)' },
    { type: 'fin_discount', cat: 'comercial', fn: 'descuento_comercial()', title: 'Precio Neto c/ Descuento', format: 'currency', tone: 'formula', defaultVal: 850, rateParam: 15, fxHint: '=Precio×(1-Desc%)' },
    { type: 'fin_payroll_cost', cat: 'comercial', fn: 'costo_nomina()', title: 'Costo Total Nómina', format: 'currency', tone: 'negative', defaultVal: 14500, rateParam: 16.5, fxHint: '=Sueldos×(1+Aporte%)' },
    { type: 'fin_runway', cat: 'comercial', fn: 'autonomia_caja()', title: 'Runway / Autonomía Caja', format: 'months', tone: 'ratio', defaultVal: 14.5, fxHint: '=Caja / BurnMes' }
  ];

  const FINANCE_MAP = new Map(FINANCE_NODE_LIST.map(d => [d.type, d]));
  const CATEGORY_MAP = new Map(FINANCE_CATEGORIES.map(c => [c.id, c]));

  let activeSheetCurrency = 'USD';
  let lastComputedSheet = {
    byNodeId: new Map(),
    byCellRef: new Map(),
    summary: {
      totalCells: 0,
      formulaCells: 0,
      errorCells: 0,
      totalInflows: 0,
      totalOutflows: 0,
      netBalance: 0,
      impliedMarginPct: null,
      npvValue: null,
      irrValue: null,
      roiValue: null
    }
  };

  function registerFinanceTypesInConfig() {
    if (typeof CONFIG === 'undefined') return;
    FINANCE_NODE_LIST.forEach(def => {
      CONFIG.NODE_TYPES[def.type] = def.title;
    });
  }

  function isFinanceNodeType(type) {
    return Boolean(type && FINANCE_MAP.has(type));
  }

  function getFinanceNodeDef(type) {
    return FINANCE_MAP.get(type) || null;
  }

  function getSheetCurrency() {
    if (typeof STATE !== 'undefined' && STATE.financeCurrency && CURRENCY_CONFIG[STATE.financeCurrency]) {
      activeSheetCurrency = STATE.financeCurrency;
    }
    return CURRENCY_CONFIG[activeSheetCurrency] || CURRENCY_CONFIG.USD;
  }

  function setSheetCurrency(code) {
    if (!CURRENCY_CONFIG[code]) return;
    activeSheetCurrency = code;
    if (typeof STATE !== 'undefined') STATE.financeCurrency = code;
    const sel = document.getElementById('finCurrencySel');
    if (sel && sel.value !== code) sel.value = code;
    if (typeof renderAll === 'function') renderAll();
    if (typeof saveState === 'function') saveState();
  }

  // Generador de coordenadas de celda estilo Excel (A1, B1, C1... A2, B2...)
  function nextAvailableCellRef(existingNodes) {
    const used = new Set();
    (existingNodes || []).forEach(n => {
      const ref = n?.params?.cellRef;
      if (ref) used.add(String(ref).toUpperCase());
    });
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let row = 1; row <= 99; row++) {
      for (const col of cols) {
        const candidate = `${col}${row}`;
        if (!used.has(candidate)) return candidate;
      }
    }
    return `Z${(existingNodes || []).length + 1}`;
  }

  function ensureFinanceNodeDefaults(node, allNodes) {
    const def = getFinanceNodeDef(node.type);
    if (!def) return node;
    if (!node.params || typeof node.params !== 'object') node.params = {};

    const pool = allNodes || (typeof STATE !== 'undefined' && Array.isArray(STATE.nodes) ? STATE.nodes : []);
    if (!node.params.cellRef) {
      node.params.cellRef = nextAvailableCellRef(pool.filter(x => x.id !== node.id));
    } else {
      node.params.cellRef = String(node.params.cellRef).trim().toUpperCase();
    }

    if (node.params.value === undefined || node.params.value === '') {
      node.params.value = def.defaultVal !== undefined ? def.defaultVal : 0;
    }
    if (def.rateParam !== undefined && node.params.rate === undefined) {
      node.params.rate = def.rateParam;
    }
    if (def.nperParam !== undefined && node.params.nper === undefined) {
      node.params.nper = def.nperParam;
    }
    if (def.perParam !== undefined && node.params.period === undefined) {
      node.params.period = def.perParam;
    }
    if (!node.params.format) {
      node.params.format = def.format || 'currency';
    }
    if (node.params.formula === undefined) {
      node.params.formula = '';
    }
    if (!node.text || node.text === 'paso') {
      node.text = def.title;
    }
    return node;
  }

  // =========================================================================
  // MATEMÁTICA FINANCIERA TIPO EXCEL (VAN, TIR, PAGO, PAGOINT, PAGOPRIN, VA, VF)
  // =========================================================================
  function calcPMT(annualRatePctOrDec, nper, pv) {
    const n = Math.max(1, Number(nper) || 1);
    const r = Math.abs(annualRatePctOrDec) > 1 ? Number(annualRatePctOrDec) / 100 / 12 : Number(annualRatePctOrDec);
    const P = Number(pv) || 0;
    if (Math.abs(r) < 1e-9) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  function calcNPV(ratePctOrDec, cashflows) {
    const r = Math.abs(ratePctOrDec) > 1 ? Number(ratePctOrDec) / 100 : Number(ratePctOrDec);
    if (!cashflows.length) return 0;
    // Si el primer flujo es negativo (inversión en t=0), descontar desde t=0; si todos positivos, descontar t=1..n
    if (cashflows[0] < 0) {
      return cashflows.reduce((acc, cf, idx) => acc + cf / Math.pow(1 + r, idx), 0);
    }
    return cashflows.reduce((acc, cf, idx) => acc + cf / Math.pow(1 + r, idx + 1), 0);
  }

  function calcIRR(cashflows) {
    if (!cashflows || cashflows.length < 2) return 0;
    let flows = cashflows.slice();
    const hasNeg = flows.some(v => v < 0);
    const hasPos = flows.some(v => v > 0);
    if (!hasNeg && hasPos) {
      // Asumir el primer valor como desembolso inicial si el usuario ingresó monto positivo en t=0
      flows = [-Math.abs(flows[0]), ...flows.slice(1)];
    }
    if (!flows.some(v => v < 0) || !flows.some(v => v > 0)) return 0;

    let low = -0.95;
    let high = 5.0;
    const npvAt = rate => flows.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0);
    let fLow = npvAt(low);
    for (let iter = 0; iter < 80; iter++) {
      const mid = (low + high) / 2;
      const fMid = npvAt(mid);
      if (Math.abs(fMid) < 1e-6) return mid * 100;
      if (fLow * fMid <= 0) {
        high = mid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return ((low + high) / 2) * 100;
  }

  // =========================================================================
  // PARSER SEGURO DE FÓRMULAS EXCEL (=A1+B1, =SUMA(A1:A4), =SI(A1>100;A1*0.1;0))
  // =========================================================================
  function expandCellRanges(expr, cellValuesMap) {
    return expr.replace(/\b([A-Z]{1,2})(\d{1,2})\s*:\s*([A-Z]{1,2})(\d{1,2})\b/gi, (_, c1, r1, c2, r2) => {
      const colStart = c1.toUpperCase().charCodeAt(0);
      const colEnd = c2.toUpperCase().charCodeAt(0);
      const rowStart = Math.min(Number(r1), Number(r2));
      const rowEnd = Math.max(Number(r1), Number(r2));
      const cMin = Math.min(colStart, colEnd);
      const cMax = Math.max(colStart, colEnd);
      const refs = [];
      for (let c = cMin; c <= cMax; c++) {
        for (let r = rowStart; r <= rowEnd; r++) {
          const ref = String.fromCharCode(c) + r;
          if (cellValuesMap.has(ref)) refs.push(ref);
        }
      }
      return refs.length ? refs.join(',') : '0';
    });
  }

  function tokenizeExcelFormula(rawExpr) {
    const tokens = [];
    let i = 0;
    const s = rawExpr.trim();
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) {
        i++;
        continue;
      }
      if (/[0-9.]/.test(ch)) {
        let numStr = '';
        while (i < s.length && /[0-9.]/.test(s[i])) numStr += s[i++];
        if (s[i] === '%') {
          i++;
          tokens.push({ type: 'num', value: ( parseFloat(numStr) || 0 ) / 100 });
        } else {
          tokens.push({ type: 'num', value: parseFloat(numStr) || 0 });
        }
        continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        let id = '';
        while (i < s.length && /[A-Za-z0-9_]/.test(s[i])) id += s[i++];
        tokens.push({ type: 'id', value: id.toUpperCase() });
        continue;
      }
      const two = s.slice(i, i + 2);
      if (two === '>=' || two === '<=' || two === '<>' || two === '==' || two === '!=') {
        tokens.push({ type: 'op', value: two });
        i += 2;
        continue;
      }
      if ('+-*/^()><=,;'.includes(ch)) {
        tokens.push({ type: ch === ';' ? ',' : ch === '(' || ch === ')' || ch === ',' ? ch : 'op', value: ch === ';' ? ',' : ch });
        i++;
        continue;
      }
      throw new Error('#SINTAXIS!');
    }
    return tokens;
  }

  function evaluateExcelFormula(rawFormula, cellValuesMap, upstreamValues) {
    const clean = String(rawFormula || '').trim().replace(/^=/, '');
    if (!clean) return { value: 0, error: null };

    const expanded = expandCellRanges(clean, cellValuesMap);
    const tokens = tokenizeExcelFormula(expanded);
    let pos = 0;

    const peek = () => tokens[pos] || null;
    const consume = () => tokens[pos++] || null;

    function callExcelFn(fnName, args) {
      const vals = args.length ? args : upstreamValues;
      switch (fnName) {
        case 'SUMA':
        case 'SUM':
          return vals.reduce((a, b) => a + b, 0);
        case 'PROMEDIO':
        case 'AVERAGE':
        case 'AVG':
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        case 'MIN':
          return vals.length ? Math.min(...vals) : 0;
        case 'MAX':
          return vals.length ? Math.max(...vals) : 0;
        case 'ABS':
          return Math.abs(vals[0] || 0);
        case 'REDONDEAR':
        case 'ROUND': {
          const dec = Math.max(0, Math.round(vals[1] ?? 2));
          const f = Math.pow(10, dec);
          return Math.round((vals[0] || 0) * f) / f;
        }
        case 'POTENCIA':
        case 'POW':
          return Math.pow(vals[0] || 0, vals[1] ?? 1);
        case 'VNA':
        case 'VAN':
        case 'NPV':
          return calcNPV(vals[0] || 0.1, vals.slice(1));
        case 'TIR':
        case 'IRR':
          return calcIRR(vals);
        case 'PAGO':
        case 'PMT':
          return calcPMT(vals[0] || 0, vals[1] || 12, vals[2] || 0);
        case 'VA':
        case 'PV': {
          const r = Math.abs(vals[0]) > 1 ? vals[0] / 100 : vals[0] || 0;
          const n = vals[1] || 1;
          const fv = vals[2] || 0;
          return fv / Math.pow(1 + r, n);
        }
        case 'VF':
        case 'FV': {
          const r = Math.abs(vals[0]) > 1 ? vals[0] / 100 : vals[0] || 0;
          const n = vals[1] || 1;
          const pv = vals[2] || 0;
          return pv * Math.pow(1 + r, n);
        }
        case 'SI':
        case 'IF':
          return vals[0] ? (vals[1] ?? 1) : (vals[2] ?? 0);
        default:
          throw new Error('#NOMBRE?');
      }
    }

    function parseComparison() {
      let left = parseAddSub();
      while (peek() && peek().type === 'op' && ['>', '<', '>=', '<=', '=', '==', '<>', '!='].includes(peek().value)) {
        const op = consume().value;
        const right = parseAddSub();
        if (op === '>') left = left > right ? 1 : 0;
        else if (op === '<') left = left < right ? 1 : 0;
        else if (op === '>=') left = left >= right ? 1 : 0;
        else if (op === '<=') left = left <= right ? 1 : 0;
        else if (op === '=' || op === '==') left = Math.abs(left - right) < 1e-9 ? 1 : 0;
        else left = Math.abs(left - right) >= 1e-9 ? 1 : 0;
      }
      return left;
    }

    function parseAddSub() {
      let left = parseMulDiv();
      while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        const right = parseMulDiv();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }

    function parseMulDiv() {
      let left = parsePower();
      while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
        const op = consume().value;
        const right = parsePower();
        if (op === '/') {
          if (Math.abs(right) < 1e-12) throw new Error('#DIV/0!');
          left = left / right;
        } else {
          left = left * right;
        }
      }
      return left;
    }

    function parsePower() {
      let base = parseUnary();
      if (peek() && peek().type === 'op' && peek().value === '^') {
        consume();
        const exp = parsePower();
        base = Math.pow(base, exp);
      }
      return base;
    }

    function parseUnary() {
      if (peek() && peek().type === 'op' && (peek().value === '-' || peek().value === '+')) {
        const op = consume().value;
        const v = parseUnary();
        return op === '-' ? -v : v;
      }
      return parsePrimary();
    }

    function parsePrimary() {
      const tok = peek();
      if (!tok) return 0;
      if (tok.type === 'num') {
        consume();
        return tok.value;
      }
      if (tok.type === '(') {
        consume();
        const val = parseComparison();
        if (peek() && peek().type === ')') consume();
        return val;
      }
      if (tok.type === 'id') {
        consume();
        if (peek() && peek().type === '(') {
          consume(); // '('
          const args = [];
          if (peek() && peek().type !== ')') {
            args.push(parseComparison());
            while (peek() && peek().type === ',') {
              consume();
              args.push(parseComparison());
            }
          }
          if (peek() && peek().type === ')') consume();
          return callExcelFn(tok.value, args);
        }
        if (tok.value === 'ENTRADAS' || tok.value === 'INPUTS') {
          return upstreamValues.reduce((a, b) => a + b, 0);
        }
        if (cellValuesMap.has(tok.value)) {
          return cellValuesMap.get(tok.value);
        }
        throw new Error('#REF!');
      }
      throw new Error('#VALOR!');
    }

    const result = parseComparison();
    if (!Number.isFinite(result)) throw new Error('#NUM!');
    return { value: result, error: null };
  }

  // =========================================================================
  // MOTOR DE CÁLCULO NATIVO PARA CADA UNO DE LOS 54 NODOS FINANCIEROS
  // =========================================================================
  function computeBuiltInFinanceNode(node, upstreamEntries) {
    const p = node.params || {};
    const baseVal = Number(p.value) || 0;
    const rate = Number(p.rate ?? 12);
    const nper = Math.max(1, Number(p.nper ?? 12));
    const period = clamp(Number(p.period ?? 1), 1, nper);
    const ins = upstreamEntries.map(u => u.value);
    const hasIn = ins.length > 0;
    const sumIn = ins.reduce((a, b) => a + b, 0);

    switch (node.type) {
      case 'fin_input':
      case 'fin_rate':
      case 'fin_periods':
      case 'fin_qty':
      case 'fin_unit_price':
        return { value: hasIn ? sumIn : baseVal, fxAuto: hasIn ? `=SUMA(${upstreamEntries.map(u => u.ref).join(';')})` : `${baseVal}` };

      case 'fin_fx_rate': {
        const amt = hasIn ? ins[0] : baseVal;
        const tc = ins.length >= 2 ? ins[1] : Number(p.rate ?? 7500);
        return { value: amt * tc, fxAuto: hasIn ? `=${upstreamEntries[0].ref}*${tc}` : `=${amt}*${tc}` };
      }

      case 'fin_formula':
      case 'fin_sum':
        return { value: hasIn ? sumIn : baseVal, fxAuto: hasIn ? `=SUMA(${upstreamEntries.map(u => u.ref).join(';')})` : `${baseVal}` };

      case 'fin_subtract': {
        if (!hasIn) return { value: baseVal, fxAuto: `${baseVal}` };
        const diff = ins.length === 1 ? ins[0] - baseVal : ins.slice(1).reduce((acc, v) => acc - v, ins[0]);
        return {
          value: diff,
          fxAuto: ins.length === 1 ? `=${upstreamEntries[0].ref}-${baseVal}` : `=${upstreamEntries.map(u => u.ref).join('-')}`
        };
      }

      case 'fin_multiply': {
        if (!hasIn) return { value: baseVal, fxAuto: `${baseVal}` };
        const prod = ins.reduce((acc, v) => acc * v, 1);
        return { value: prod, fxAuto: `=${upstreamEntries.map(u => u.ref).join('*')}` };
      }

      case 'fin_divide': {
        if (ins.length >= 2) {
          if (Math.abs(ins[1]) < 1e-12) return { value: 0, error: '#DIV/0!', fxAuto: `=${upstreamEntries[0].ref}/${upstreamEntries[1].ref}` };
          return { value: ins[0] / ins[1], fxAuto: `=${upstreamEntries[0].ref}/${upstreamEntries[1].ref}` };
        }
        return { value: hasIn ? ins[0] : baseVal, fxAuto: hasIn ? `=${upstreamEntries[0].ref}` : `${baseVal}` };
      }

      case 'fin_average':
        return {
          value: hasIn ? sumIn / ins.length : baseVal,
          fxAuto: hasIn ? `=PROMEDIO(${upstreamEntries.map(u => u.ref).join(';')})` : `${baseVal}`
        };

      case 'fin_min_max': {
        const mode = p.aggMode === 'min' ? 'MIN' : 'MAX';
        if (!hasIn) return { value: baseVal, fxAuto: `${baseVal}` };
        return {
          value: mode === 'MIN' ? Math.min(...ins) : Math.max(...ins),
          fxAuto: `=${mode}(${upstreamEntries.map(u => u.ref).join(';')})`
        };
      }

      case 'fin_if_cond': {
        const threshold = Number(p.threshold ?? 0);
        const testVal = hasIn ? ins[0] : baseVal;
        const passVal = ins.length >= 2 ? ins[1] : testVal;
        const failVal = ins.length >= 3 ? ins[2] : 0;
        return {
          value: testVal >= threshold ? passVal : failVal,
          fxAuto: `=SI(${hasIn ? upstreamEntries[0].ref : testVal}>=${threshold})`
        };
      }

      case 'fin_variance_pct': {
        if (ins.length >= 2) {
          if (Math.abs(ins[0]) < 1e-12) return { value: 0, error: '#DIV/0!', fxAuto: '=(Act-Base)/Base' };
          return {
            value: ((ins[1] - ins[0]) / Math.abs(ins[0])) * 100,
            fxAuto: `=(${upstreamEntries[1].ref}-${upstreamEntries[0].ref})/|${upstreamEntries[0].ref}|`
          };
        }
        return { value: baseVal, fxAuto: `${baseVal}%` };
      }

      // Estado de resultados P&L (inteligente con nodos de ingreso vs costo conectados)
      case 'fin_revenue': {
        // Si entran Cantidad y Precio Unitario, multiplicarlos automáticamente; si no, sumar fuentes de ingreso
        const hasQtyAndPrice =
          upstreamEntries.length === 2 &&
          upstreamEntries.some(u => u.nodeType === 'fin_qty') &&
          upstreamEntries.some(u => u.nodeType === 'fin_unit_price');
        if (hasQtyAndPrice) {
          return {
            value: ins[0] * ins[1],
            fxAuto: `=${upstreamEntries[0].ref}*${upstreamEntries[1].ref}`
          };
        }
        return { value: hasIn ? sumIn : baseVal, fxAuto: hasIn ? `=SUMA(${upstreamEntries.map(u => u.ref).join(';')})` : `${baseVal}` };
      }

      case 'fin_cogs':
      case 'fin_opex':
      case 'fin_cash_in':
      case 'fin_cash_out':
      case 'fin_capex':
        return { value: hasIn ? sumIn : baseVal, fxAuto: hasIn ? `=SUMA(${upstreamEntries.map(u => u.ref).join(';')})` : `${baseVal}` };

      case 'fin_depreciation': {
        if (hasIn) {
          const assetVal = ins[0];
          const life = Math.max(1, Number(p.nper ?? 5));
          return { value: assetVal / life, fxAuto: `=${upstreamEntries[0].ref}/${life}` };
        }
        return { value: baseVal, fxAuto: `${baseVal}` };
      }

      case 'fin_gross_profit':
      case 'fin_ebitda':
      case 'fin_ebit':
      case 'fin_net_income':
      case 'fin_ocf':
      case 'fin_fcf':
      case 'fin_working_cap': {
        if (!hasIn) return { value: baseVal, fxAuto: `${baseVal}` };
        if (ins.length === 1) return { value: ins[0], fxAuto: `=${upstreamEntries[0].ref}` };
        // El primer nodo positivo/ingreso menos los nodos de costo/salida secundarios
        const costTypes = new Set([
          'fin_cogs', 'fin_opex', 'fin_depreciation', 'fin_tax',
          'fin_cash_out', 'fin_capex', 'fin_pmt', 'fin_ipmt', 'fin_payroll_cost'
        ]);
        let total = 0;
        const parts = [];
        upstreamEntries.forEach((u, idx) => {
          const isCost = costTypes.has(u.nodeType) || (idx > 0 && u.value >= 0 && !u.nodeType.includes('revenue') && !u.nodeType.includes('cash_in'));
          if (idx === 0 && !costTypes.has(u.nodeType)) {
            total += u.value;
            parts.push(u.ref);
          } else if (isCost) {
            total -= Math.abs(u.value);
            parts.push(`-${u.ref}`);
          } else {
            total += u.value;
            parts.push(`+${u.ref}`);
          }
        });
        return { value: total, fxAuto: `=${parts.join('')}` };
      }

      case 'fin_tax': {
        const taxable = hasIn ? ins[0] : baseVal;
        const taxRate = ins.length >= 2 ? ins[1] : rate;
        const taxVal = Math.max(0, taxable) * (taxRate / 100);
        return { value: taxVal, fxAuto: `=MAX(0;${hasIn ? upstreamEntries[0].ref : taxable})*${taxRate}%` };
      }

      // Inversión: VAN, TIR, ROI, Payback, VA, VF, CAGR
      case 'fin_npv': {
        if (!hasIn) return { value: baseVal, fxAuto: `=VNA(${rate}%; ...)` };
        // Si el primer nodo es CAPEX / inversión positiva, tratarlo como desembolso -I0
        const flows = upstreamEntries.map((u, idx) =>
          idx === 0 && (u.nodeType === 'fin_capex' || u.nodeType === 'fin_input') && ins.length >= 2 && u.value > 0
            ? -u.value
            : u.value
        );
        return {
          value: calcNPV(rate, flows),
          fxAuto: `=VNA(${rate}%; ${upstreamEntries.map(u => u.ref).join(';')})`
        };
      }

      case 'fin_irr': {
        if (ins.length >= 2) {
          const flows = upstreamEntries.map((u, idx) =>
            idx === 0 && u.value > 0 ? -u.value : u.value
          );
          return {
            value: calcIRR(flows),
            fxAuto: `=TIR(${upstreamEntries.map(u => u.ref).join(';')})`
          };
        }
        return { value: baseVal, fxAuto: `=TIR(flujos)` };
      }

      case 'fin_roi': {
        if (ins.length >= 2) {
          const inv = Math.abs(ins[0]);
          const gain = ins[1];
          if (inv < 1e-12) return { value: 0, error: '#DIV/0!', fxAuto: '=(Gan-Inv)/Inv' };
          return {
            value: ((gain - inv) / inv) * 100,
            fxAuto: `=(${upstreamEntries[1].ref}-${upstreamEntries[0].ref})/${upstreamEntries[0].ref}`
          };
        }
        return { value: baseVal, fxAuto: `${baseVal}%` };
      }

      case 'fin_payback': {
        if (ins.length >= 2) {
          if (Math.abs(ins[1]) < 1e-12) return { value: 0, error: '#DIV/0!', fxAuto: '=Inv/Flujo' };
          return {
            value: Math.abs(ins[0]) / ins[1],
            fxAuto: `=${upstreamEntries[0].ref}/${upstreamEntries[1].ref}`
          };
        }
        return { value: baseVal, fxAuto: `${baseVal} per` };
      }

      case 'fin_pv': {
        const fv = hasIn ? ins[0] : baseVal;
        const r = rate / 100;
        return { value: fv / Math.pow(1 + r, nper), fxAuto: `=VA(${rate}%; ${nper}; ${hasIn ? upstreamEntries[0].ref : fv})` };
      }

      case 'fin_fv': {
        const pv = hasIn ? ins[0] : baseVal;
        const r = rate / 100;
        return { value: pv * Math.pow(1 + r, nper), fxAuto: `=VF(${rate}%; ${nper}; ${hasIn ? upstreamEntries[0].ref : pv})` };
      }

      case 'fin_cagr': {
        if (ins.length >= 2 && ins[0] > 0 && ins[1] > 0) {
          return {
            value: (Math.pow(ins[1] / ins[0], 1 / nper) - 1) * 100,
            fxAuto: `=(${upstreamEntries[1].ref}/${upstreamEntries[0].ref})^(1/${nper})-1`
          };
        }
        return { value: baseVal, fxAuto: `${baseVal}%` };
      }

      // Préstamos y Amortización Sistema Francés
      case 'fin_pmt': {
        const principal = hasIn ? ins[0] : baseVal || 35000;
        const r = ins.length >= 2 ? ins[1] : rate;
        const n = ins.length >= 3 ? ins[2] : nper;
        return {
          value: calcPMT(r, n, principal),
          fxAuto: `=PAGO(${r}%/12; ${n}; ${hasIn ? upstreamEntries[0].ref : principal})`
        };
      }

      case 'fin_ipmt':
      case 'fin_ppmt':
      case 'fin_loan_balance': {
        const principal = hasIn ? ins[0] : baseVal || 35000;
        const rMonthly = (ins.length >= 2 ? ins[1] : rate) / 100 / 12;
        const n = Math.max(1, ins.length >= 3 ? ins[2] : nper);
        const pmt = calcPMT(rMonthly, n, principal);
        let balance = principal;
        let ipmt = 0;
        let ppmt = 0;
        for (let k = 1; k <= period; k++) {
          ipmt = balance * rMonthly;
          ppmt = pmt - ipmt;
          balance = Math.max(0, balance - ppmt);
        }
        if (node.type === 'fin_ipmt') return { value: ipmt, fxAuto: `=PAGOINT(per ${period}/${n})` };
        if (node.type === 'fin_ppmt') return { value: ppmt, fxAuto: `=PAGOPRIN(per ${period}/${n})` };
        return { value: balance, fxAuto: `=SALDO(cuota ${period}/${n})` };
      }

      case 'fin_compound_int': {
        const cap = hasIn ? ins[0] : baseVal || 10000;
        return {
          value: cap * (Math.pow(1 + rate / 100, nper) - 1),
          fxAuto: `=${hasIn ? upstreamEntries[0].ref : cap}*((1+${rate}%)^${nper}-1)`
        };
      }

      case 'fin_dscr':
      case 'fin_liquidity': {
        if (ins.length >= 2) {
          if (Math.abs(ins[1]) < 1e-12) return { value: 0, error: '#DIV/0!', fxAuto: `=${upstreamEntries[0].ref}/${upstreamEntries[1].ref}` };
          return { value: ins[0] / Math.abs(ins[1]), fxAuto: `=${upstreamEntries[0].ref}/${upstreamEntries[1].ref}` };
        }
        return { value: baseVal, fxAuto: `${baseVal}x` };
      }

      // Ratios y Equilibrio
      case 'fin_gross_margin':
      case 'fin_net_margin':
      case 'fin_roe':
      case 'fin_roa': {
        if (ins.length >= 2) {
          // Soportar orden (Utilidad, Ventas) o (Ventas, Utilidad) detectando semántica si existe
          let num = ins[0];
          let den = ins[1];
          let numRef = upstreamEntries[0].ref;
          let denRef = upstreamEntries[1].ref;
          if (upstreamEntries[0].nodeType === 'fin_revenue' && upstreamEntries[1].nodeType !== 'fin_revenue') {
            num = ins[1];
            den = ins[0];
            numRef = upstreamEntries[1].ref;
            denRef = upstreamEntries[0].ref;
          }
          if (Math.abs(den) < 1e-12) return { value: 0, error: '#DIV/0!', fxAuto: `=${numRef}/${denRef}` };
          return { value: (num / den) * 100, fxAuto: `=${numRef}/${denRef}` };
        }
        return { value: baseVal, fxAuto: `${baseVal}%` };
      }

      case 'fin_breakeven': {
        if (ins.length >= 3) {
          const cf = ins[0];
          const pUnit = ins[1];
          const cvUnit = ins[2];
          if (pUnit - cvUnit <= 0) return { value: 0, error: '#MARGEN<=0!', fxAuto: '=CF/(P-CVu)' };
          return {
            value: cf / (pUnit - cvUnit),
            fxAuto: `=${upstreamEntries[0].ref}/(${upstreamEntries[1].ref}-${upstreamEntries[2].ref})`
          };
        }
        return { value: baseVal, fxAuto: '=CF/(P-CVu)' };
      }

      // Comerciales e Impuestos
      case 'fin_vat_iva': {
        const amt = hasIn ? ins[0] : baseVal;
        const ivaMode = p.ivaMode || 'add'; // 'add' (+IVA) o 'included' (IVA incluido)
        const v = ivaMode === 'included' ? amt - amt / (1 + rate / 100) : amt * (rate / 100);
        return {
          value: v,
          fxAuto: ivaMode === 'included' ? `=IVA_INC(${rate}%)` : `=${hasIn ? upstreamEntries[0].ref : amt}*${rate}%`
        };
      }

      case 'fin_markup_price': {
        const cost = hasIn ? ins[0] : baseVal || 95;
        const mg = clamp(rate, 0, 99) / 100;
        return { value: cost / (1 - mg), fxAuto: `=${hasIn ? upstreamEntries[0].ref : cost}/(1-${rate}%)` };
      }

      case 'fin_discount': {
        const price = hasIn ? ins[0] : baseVal;
        const disc = clamp(rate, 0, 100) / 100;
        return { value: price * (1 - disc), fxAuto: `=${hasIn ? upstreamEntries[0].ref : price}*(1-${rate}%)` };
      }

      case 'fin_payroll_cost': {
        const grossWages = hasIn ? sumIn : baseVal;
        return { value: grossWages * (1 + rate / 100), fxAuto: `=${hasIn ? 'SUMA' : grossWages}*(1+${rate}%)` };
      }

      case 'fin_runway': {
        if (ins.length >= 2) {
          const burn = Math.abs(ins[1]);
          if (burn < 1e-12) return { value: 999, fxAuto: '=Caja/Burn' };
          return { value: ins[0] / burn, fxAuto: `=${upstreamEntries[0].ref}/${upstreamEntries[1].ref}` };
        }
        return { value: baseVal, fxAuto: `${baseVal} meses` };
      }

      default:
        return { value: baseVal, fxAuto: `${baseVal}` };
    }
  }

  function formatFinanceNumber(val, formatType, errorCode) {
    if (errorCode) return errorCode;
    const num = Number(val) || 0;
    const cur = getSheetCurrency();

    if (formatType === 'percent') {
      return `${num >= 0 ? '' : '-'}${Math.abs(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}%`;
    }
    if (formatType === 'multiple') {
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
    }
    if (formatType === 'months') {
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} per`;
    }
    if (formatType === 'number') {
      return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    const absStr = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: cur.decimals,
      maximumFractionDigits: cur.decimals
    });
    return num < 0 ? `-${cur.symbol}${absStr}` : `${cur.symbol}${absStr}`;
  }

  // =========================================================================
  // EVALUADOR REACTIVO DAG DE LA PLANILLA ENTERA
  // =========================================================================
  function evaluateFinanceSheet() {
    if (typeof STATE === 'undefined' || !Array.isArray(STATE.nodes)) return lastComputedSheet;

    const finNodes = STATE.nodes.filter(n => isFinanceNodeType(n.type));
    const byNodeId = new Map();
    const byCellRef = new Map();

    if (!finNodes.length) {
      lastComputedSheet = {
        byNodeId,
        byCellRef,
        summary: {
          totalCells: 0,
          formulaCells: 0,
          errorCells: 0,
          totalInflows: 0,
          totalOutflows: 0,
          netBalance: 0,
          impliedMarginPct: null,
          npvValue: null,
          irrValue: null,
          roiValue: null
        }
      };
      return lastComputedSheet;
    }

    // Garantizar parámetros y referencias únicas A1..Zn
    finNodes.forEach(n => ensureFinanceNodeDefaults(n, finNodes));

    const finMap = new Map(finNodes.map(n => [n.id, n]));
    const cellToNodeId = new Map(finNodes.map(n => [String(n.params.cellRef).toUpperCase(), n.id]));
    const incoming = new Map(finNodes.map(n => [n.id, []]));
    const topoOutgoing = new Map(finNodes.map(n => [n.id, new Set()]));
    const indegree = new Map(finNodes.map(n => [n.id, 0]));

    const addTopoDep = (fromId, toId) => {
      if (!fromId || !toId || fromId === toId) return;
      const outSet = topoOutgoing.get(fromId);
      if (outSet && !outSet.has(toId)) {
        outSet.add(toId);
        indegree.set(toId, (indegree.get(toId) || 0) + 1);
      }
    };

    (STATE.edges || []).forEach(e => {
      if (finMap.has(e.from) && finMap.has(e.to) && e.from !== e.to) {
        incoming.get(e.to).push(e.from);
        addTopoDep(e.from, e.to);
      }
    });

    // Incluir dependencias declaradas por referencias de celda en fórmulas Excel (=A1+B2, =SUMA(A1:A4))
    finNodes.forEach(n => {
      const fx = String(n.params?.formula || '').trim();
      if (!fx) return;
      const expanded = expandCellRanges(fx.replace(/^=/, ''), cellToNodeId);
      const matches = expanded.toUpperCase().match(/\b[A-Z]{1,2}\d{1,2}\b/g) || [];
      matches.forEach(ref => {
        const srcId = cellToNodeId.get(ref);
        if (srcId) {
          if (srcId === n.id) {
            // Autorreferencia circular directa (=A1 dentro de A1)
            indegree.set(n.id, (indegree.get(n.id) || 0) + 1);
          } else {
            addTopoDep(srcId, n.id);
          }
        }
      });
    });

    // Orden topológico Kahn para evaluar hojas de cálculo sin ciclos
    const queue = [];
    indegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const topoOrder = [];
    while (queue.length > 0) {
      const id = queue.shift();
      topoOrder.push(id);
      (topoOutgoing.get(id) || []).forEach(nxt => {
        indegree.set(nxt, indegree.get(nxt) - 1);
        if (indegree.get(nxt) === 0) queue.push(nxt);
      });
    }

    const inTopo = new Set(topoOrder);
    const cycleIds = new Set(finNodes.filter(n => !inTopo.has(n.id)).map(n => n.id));

    let formulaCells = 0;
    let errorCells = 0;

    // Evaluar nodos sin ciclos en orden de dependencia
    topoOrder.forEach(id => {
      const n = finMap.get(id);
      const def = getFinanceNodeDef(n.type);
      const upIds = incoming.get(id) || [];
      const upstreamEntries = upIds
        .map(uid => {
          const upRes = byNodeId.get(uid);
          const upNode = finMap.get(uid);
          if (!upRes || !upNode) return null;
          return {
            id: uid,
            ref: upNode.params.cellRef,
            nodeType: upNode.type,
            value: upRes.value,
            error: upRes.error
          };
        })
        .filter(Boolean);

      const upstreamErr = upstreamEntries.find(u => u.error);
      let value = 0;
      let error = null;
      let fxText = '';

      const customFx = String(n.params?.formula || '').trim();
      if (upstreamErr) {
        error = upstreamErr.error;
        fxText = customFx || def?.fxHint || '';
      } else if (customFx) {
        formulaCells++;
        fxText = customFx.startsWith('=') ? customFx : '=' + customFx;
        try {
          const parsed = evaluateExcelFormula(
            fxText,
            byCellRef,
            upstreamEntries.map(u => u.value)
          );
          value = parsed.value;
          error = parsed.error;
        } catch (err) {
          error = err?.message || '#ERROR!';
        }
      } else {
        if (upstreamEntries.length > 0 || def?.cat !== 'entradas') formulaCells++;
        const computed = computeBuiltInFinanceNode(n, upstreamEntries);
        value = computed.value;
        error = computed.error || null;
        fxText = computed.fxAuto || def?.fxHint || '';
      }

      if (error) errorCells++;

      const fmt = n.params?.format || def?.format || 'currency';
      const formatted = formatFinanceNumber(value, fmt, error);

      const entry = {
        id: n.id,
        cellRef: n.params.cellRef,
        title: n.text || def?.title || n.type,
        type: n.type,
        value,
        formatted,
        error,
        fxText,
        format: fmt,
        upstreamRefs: upstreamEntries.map(u => u.ref)
      };

      byNodeId.set(n.id, entry);
      byCellRef.set(n.params.cellRef, error ? 0 : value);
    });

    // Marcar explícitamente celdas involucradas en referencia circular (#CICLO!)
    cycleIds.forEach(id => {
      const n = finMap.get(id);
      errorCells++;
      byNodeId.set(id, {
        id,
        cellRef: n.params.cellRef,
        title: n.text || n.type,
        type: n.type,
        value: 0,
        formatted: '#CICLO!',
        error: '#CICLO!',
        fxText: n.params?.formula || 'Referencia circular',
        format: n.params?.format || 'currency',
        upstreamRefs: []
      });
    });

    // Calcular métricas financieras propias agregadas del lienzo
    let totalInflows = 0;
    let totalOutflows = 0;
    let explicitNet = null;
    let npvValue = null;
    let irrValue = null;
    let roiValue = null;

    const inflowTypes = new Set(['fin_revenue', 'fin_cash_in']);
    const outflowTypes = new Set([
      'fin_cogs', 'fin_opex', 'fin_depreciation', 'fin_tax',
      'fin_cash_out', 'fin_capex', 'fin_payroll_cost'
    ]);

    finNodes.forEach(n => {
      const res = byNodeId.get(n.id);
      if (!res || res.error) return;
      if (inflowTypes.has(n.type)) totalInflows += res.value;
      if (outflowTypes.has(n.type)) totalOutflows += Math.abs(res.value);
      if (n.type === 'fin_net_income' || n.type === 'fin_fcf') explicitNet = res.value;
      if (n.type === 'fin_npv') npvValue = res.value;
      if (n.type === 'fin_irr') irrValue = res.value;
      if (n.type === 'fin_roi') roiValue = res.value;
    });

    const netBalance = explicitNet !== null ? explicitNet : totalInflows - totalOutflows;
    const impliedMarginPct =
      totalInflows > 0 ? (netBalance / totalInflows) * 100 : null;

    lastComputedSheet = {
      byNodeId,
      byCellRef,
      summary: {
        totalCells: finNodes.length,
        formulaCells,
        errorCells,
        totalInflows,
        totalOutflows,
        netBalance,
        impliedMarginPct,
        npvValue,
        irrValue,
        roiValue
      }
    };

    syncFormulaBarUI();
    return lastComputedSheet;
  }

  // =========================================================================
  // RENDERIZADO HTML DE CADA NODO CELDA EN EL LIENZO
  // =========================================================================
  function renderFinanceNodeHtml(n) {
    const def = getFinanceNodeDef(n.type);
    ensureFinanceNodeDefaults(n, STATE.nodes || []);
    const evalEntry =
      lastComputedSheet.byNodeId.get(n.id) || {
        cellRef: n.params.cellRef,
        formatted: formatFinanceNumber(n.params.value || 0, n.params.format || def?.format || 'currency', null),
        value: Number(n.params.value) || 0,
        error: null,
        fxText: n.params.formula || def?.fxHint || '',
        upstreamRefs: []
      };

    const catInfo = CATEGORY_MAP.get(def?.cat) || { label: 'finanzas' };
    const valCls = evalEntry.error
      ? 'is-err'
      : def?.tone === 'negative'
        ? 'is-neg'
        : evalEntry.value < 0
          ? 'is-neg'
          : def?.tone === 'positive' || (evalEntry.value > 0 && (n.type === 'fin_npv' || n.type === 'fin_net_income' || n.type === 'fin_ebitda' || n.type === 'fin_fcf'))
            ? 'is-pos'
            : '';

    const refsLabel = evalEntry.upstreamRefs.length
      ? `← ${evalEntry.upstreamRefs.slice(0, 3).join(',')}${evalEntry.upstreamRefs.length > 3 ? '…' : ''}`
      : 'entrada';

    return `
      <div class="fin-card-top">
        <span class="fin-cell-pill">${escapeHTML(evalEntry.cellRef)}</span>
        <span class="fin-cat-tag">${escapeHTML(catInfo.label)}</span>
      </div>
      <div class="fin-card-title text">${escapeHTML(n.text || def?.title || 'Celda')}</div>
      <div class="fin-card-val ${valCls}">${escapeHTML(evalEntry.formatted)}</div>
      <div class="fin-card-foot">
        <span class="fin-card-fx">${escapeHTML(evalEntry.fxText)}</span>
        <span class="fin-card-refs">${escapeHTML(refsLabel)}</span>
      </div>
    `;
  }

  function getFinanceNodeToneClass(type) {
    const def = getFinanceNodeDef(type);
    if (!def) return 'fin-node fin-tone-input';
    return `fin-node fin-tone-${def.tone || 'input'}`;
  }

  // =========================================================================
  // MODO DEL ESPACIO DE TRABAJO (FLUJO VS PLANILLA FINANCIERA FX)
  // =========================================================================
  function isFinanceWorkspaceActive() {
    if (typeof STATE === 'undefined') return false;
    if (STATE.canvasDomain === 'finance') return true;
    // Si todos los nodos o el nodo seleccionado son financieros, mostrar herramientas financieras
    if (STATE.sel && STATE.sel.kind === 'node') {
      const selNode = byId(STATE.sel.id);
      if (selNode && isFinanceNodeType(selNode.type)) return true;
    }
    return false;
  }

  function setCanvasDomain(domain, silent = false) {
    const cleanDomain = domain === 'finance' ? 'finance' : 'workflow';
    if (typeof STATE !== 'undefined') {
      STATE.canvasDomain = cleanDomain;
    }

    document.querySelectorAll('[data-ws-domain]').forEach(btn => {
      const active = btn.dataset.wsDomain === cleanDomain;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const wfPane = document.getElementById('paletteWorkflowPane');
    const finPane = document.getElementById('paletteFinancePane');
    if (wfPane) wfPane.hidden = cleanDomain === 'finance';
    if (finPane) finPane.hidden = cleanDomain !== 'finance';

    const tabStats = document.getElementById('tabStats');
    if (tabStats) {
      tabStats.textContent = cleanDomain === 'finance' ? 'métricas fx' : 'stats';
    }

    syncFormulaBarUI();
    if (typeof updatePanel === 'function') updatePanel();
    if (!silent && typeof saveState === 'function') saveState();
  }

  function syncFormulaBarUI() {
    const bar = document.getElementById('finFormulaBar');
    if (!bar || typeof STATE === 'undefined') return;

    const selNode = STATE.sel && STATE.sel.kind === 'node' ? byId(STATE.sel.id) : null;
    const hasFinNodes = Array.isArray(STATE.nodes) && STATE.nodes.some(n => isFinanceNodeType(n.type));
    const showBar = STATE.canvasDomain === 'finance' || Boolean(selNode && isFinanceNodeType(selNode.type)) || hasFinNodes;

    bar.hidden = !showBar;
    if (!showBar) return;

    const cellInput = document.getElementById('finBarCellRef');
    const fxInput = document.getElementById('finBarFormulaInput');
    const resSpan = document.getElementById('finBarResult');
    const curSel = document.getElementById('finCurrencySel');

    if (curSel && curSel.value !== activeSheetCurrency) {
      curSel.value = activeSheetCurrency;
    }

    if (selNode && isFinanceNodeType(selNode.type)) {
      ensureFinanceNodeDefaults(selNode, STATE.nodes);
      const computed = lastComputedSheet.byNodeId.get(selNode.id);
      if (cellInput && document.activeElement !== cellInput) {
        cellInput.value = selNode.params.cellRef || 'A1';
        cellInput.disabled = false;
      }
      if (fxInput && document.activeElement !== fxInput) {
        fxInput.value = selNode.params.formula
          ? selNode.params.formula
          : String(selNode.params.value ?? 0);
        fxInput.disabled = false;
        fxInput.placeholder = 'Escribe un número o fórmula Excel (ej: =A1-B1, =SUMA(A1:A3), =VNA(12%;B1:B4))';
      }
      if (resSpan) {
        resSpan.textContent = computed ? `= ${computed.formatted}` : '= 0';
      }
    } else {
      if (cellInput && document.activeElement !== cellInput) {
        cellInput.value = '--';
        cellInput.disabled = true;
      }
      if (fxInput && document.activeElement !== fxInput) {
        fxInput.value = '';
        fxInput.disabled = true;
        fxInput.placeholder = 'Selecciona una celda financiera en el lienzo para editar su valor o fórmula fx...';
      }
      if (resSpan) {
        const netFmt = formatFinanceNumber(lastComputedSheet.summary.netBalance, 'currency', null);
        resSpan.textContent = `Neto: ${netFmt}`;
      }
    }
  }

  // =========================================================================
  // PALETA LATERAL DE 54 NODOS FINANCIEROS + BUSCADOR + PLANTILLAS EXCEL
  // =========================================================================
  function populateFinancePaletteDOM() {
    const container = document.getElementById('finCategoriesMount');
    if (!container) return;

    container.innerHTML = FINANCE_CATEGORIES.map((cat, idx) => {
      const items = FINANCE_NODE_LIST.filter(n => n.cat === cat.id);
      const collapsedClass = idx >= 3 ? 'is-collapsed' : '';
      return `
        <div class="fin-cat-group ${collapsedClass}" data-fin-cat="${cat.id}">
          <button type="button" class="fin-cat-head" data-fin-cat-toggle="${cat.id}">
            <span class="prev">${cat.icon}</span>
            <span>${escapeHTML(cat.label)}</span>
            <span class="fin-cat-count">${items.length}</span>
            <svg class="fin-cat-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="fin-cat-body">
            ${items
              .map(
                item => `
                <button class="tool fin-tool-item" type="button" data-add="${item.type}" data-fin-search="${escapeHTML((item.fn + ' ' + item.title + ' ' + item.fxHint).toLowerCase())}" title="${escapeHTML(item.title + ' · ' + item.fxHint)}">
                  <span class="prev">${cat.icon}</span>
                  <span>${escapeHTML(item.fn)}</span>
                </button>
              `
              )
              .join('')}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-fin-cat-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const grp = btn.closest('.fin-cat-group');
        if (grp) grp.classList.toggle('is-collapsed');
      });
    });

    const searchInput = document.getElementById('finPaletteSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        const q = String(e.target.value || '').trim().toLowerCase();
        container.querySelectorAll('.fin-cat-group').forEach(grp => {
          let visibleCount = 0;
          grp.querySelectorAll('.fin-tool-item').forEach(btn => {
            const hay = btn.dataset.finSearch || '';
            const match = !q || hay.includes(q);
            btn.style.display = match ? '' : 'none';
            if (match) visibleCount++;
          });
          grp.style.display = visibleCount > 0 ? '' : 'none';
          if (q && visibleCount > 0) grp.classList.remove('is-collapsed');
        });
      });
    }
  }

  // =========================================================================
  // INSPECTOR DE PROPIEDADES Y PANEL DE MÉTRICAS FINANCIERAS PROPIAS
  // =========================================================================
  function renderFinanceNodeInspector(container, n) {
    const def = getFinanceNodeDef(n.type);
    ensureFinanceNodeDefaults(n, STATE.nodes || []);
    evaluateFinanceSheet();
    const res = lastComputedSheet.byNodeId.get(n.id);

    const upstreamListHtml =
      res && res.upstreamRefs.length
        ? `<div style="margin-top:8px;padding:7px;background:var(--bg2);border:1px solid var(--line);border-radius:6px;font-size:9.3px">
            <div style="font-weight:700;color:var(--tx1);margin-bottom:4px">celdas conectadas (entradas)</div>
            ${res.upstreamRefs
              .map(ref => {
                const v = lastComputedSheet.byCellRef.get(ref) ?? 0;
                return `<div style="display:flex;justify-content:space-between;padding:2px 0;color:var(--tx2)"><strong style="color:var(--green)">[${escapeHTML(ref)}]</strong><span>${escapeHTML(formatFinanceNumber(v, 'currency', null))}</span></div>`;
              })
              .join('')}
          </div>`
        : '';

    const needsRate =
      def?.rateParam !== undefined ||
      ['fin_rate', 'fin_npv', 'fin_pv', 'fin_fv', 'fin_pmt', 'fin_ipmt', 'fin_ppmt', 'fin_loan_balance', 'fin_compound_int', 'fin_tax', 'fin_vat_iva', 'fin_markup_price', 'fin_discount', 'fin_payroll_cost', 'fin_fx_rate'].includes(n.type);

    const needsPeriods =
      def?.nperParam !== undefined ||
      ['fin_periods', 'fin_pv', 'fin_fv', 'fin_cagr', 'fin_pmt', 'fin_ipmt', 'fin_ppmt', 'fin_loan_balance', 'fin_compound_int', 'fin_depreciation'].includes(n.type);

    const needsPeriodIdx = ['fin_ipmt', 'fin_ppmt', 'fin_loan_balance'].includes(n.type);

    container.innerHTML = `
      <h3>celda financiera :: ${escapeHTML(n.params.cellRef)}</h3>
      <div style="padding:8px 10px;margin-bottom:8px;border-radius:6px;background:rgba(74,222,128,0.07);border:1px solid rgba(134,239,172,0.28);display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:9.5px;color:var(--tx2)">resultado actual</span>
        <strong style="font-size:13.5px;color:var(--green)">${escapeHTML(res ? res.formatted : '0')}</strong>
      </div>

      <div style="display:grid;grid-template-columns:78px 1fr;gap:6px">
        <div>
          <label>celda</label>
          <input type="text" id="finPropCellRef" maxlength="4" value="${escapeHTML(n.params.cellRef)}" style="text-transform:uppercase;font-weight:700;color:var(--green)">
        </div>
        <div>
          <label>concepto / etiqueta</label>
          <input type="text" id="finPropTitle" value="${escapeHTML(n.text || '')}">
        </div>
      </div>

      <label>valor numérico base</label>
      <input type="number" step="any" id="finPropValue" value="${Number(n.params.value ?? 0)}">

      <label>fórmula excel personalizada (opcional)</label>
      <input type="text" id="finPropFormula" placeholder="Ej: =A1-B1 o =SUMA(A1:A4) o =VNA(12%;B1:B4)" value="${escapeHTML(n.params.formula || '')}">
      <div style="font-size:8.3px;color:var(--tx3);margin-top:2px">Si se deja vacío usa la fórmula nativa del nodo: <code>${escapeHTML(res?.fxText || def?.fxHint || '')}</code></div>

      ${needsRate ? `<label>tasa / porcentaje / factor (%)</label><input type="number" step="any" id="finPropRate" value="${Number(n.params.rate ?? def?.rateParam ?? 12)}">` : ''}
      ${needsPeriods ? `<label>plazo / n° de periodos (nper)</label><input type="number" step="1" min="1" id="finPropNper" value="${Number(n.params.nper ?? def?.nperParam ?? 12)}">` : ''}
      ${needsPeriodIdx ? `<label>cuota / periodo a evaluar (k)</label><input type="number" step="1" min="1" id="finPropPeriodIdx" value="${Number(n.params.period ?? 1)}">` : ''}

      <label>formato de celda</label>
      <select id="finPropFormat">
        <option value="currency" ${n.params.format === 'currency' ? 'selected' : ''}>Moneda (${getSheetCurrency().code})</option>
        <option value="percent" ${n.params.format === 'percent' ? 'selected' : ''}>Porcentaje (%)</option>
        <option value="number" ${n.params.format === 'number' ? 'selected' : ''}>Número decimal</option>
        <option value="multiple" ${n.params.format === 'multiple' ? 'selected' : ''}>Múltiplo / Ratio (x)</option>
        <option value="months" ${n.params.format === 'months' ? 'selected' : ''}>Periodos / Meses</option>
      </select>

      ${upstreamListHtml}
    `;

    const refreshCalc = () => {
      evaluateFinanceSheet();
      renderNodes();
      drawEdges();
      if (typeof drawMinimap === 'function') drawMinimap();
      if (typeof saveState === 'function') saveState();
    };

    document.getElementById('finPropCellRef')?.addEventListener('change', e => {
      const clean = String(e.target.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (/^[A-Z]{1,2}\d{1,2}$/.test(clean)) {
        n.params.cellRef = clean;
        commitHistory();
        refreshCalc();
        updatePanel();
      }
    });

    document.getElementById('finPropTitle')?.addEventListener('input', e => {
      n.text = e.target.value;
      refreshCalc();
    });

    document.getElementById('finPropValue')?.addEventListener('input', e => {
      n.params.value = parseFloat(e.target.value) || 0;
      refreshCalc();
      const strongEl = container.querySelector('strong');
      const updated = lastComputedSheet.byNodeId.get(n.id);
      if (strongEl && updated) strongEl.textContent = updated.formatted;
    });

    document.getElementById('finPropFormula')?.addEventListener('change', e => {
      const raw = e.target.value.trim();
      n.params.formula = raw ? (raw.startsWith('=') ? raw : '=' + raw) : '';
      commitHistory();
      refreshCalc();
      updatePanel();
    });

    document.getElementById('finPropRate')?.addEventListener('input', e => {
      n.params.rate = parseFloat(e.target.value) || 0;
      refreshCalc();
      const strongEl = container.querySelector('strong');
      const updated = lastComputedSheet.byNodeId.get(n.id);
      if (strongEl && updated) strongEl.textContent = updated.formatted;
    });

    document.getElementById('finPropNper')?.addEventListener('input', e => {
      n.params.nper = Math.max(1, parseInt(e.target.value, 10) || 1);
      refreshCalc();
      const strongEl = container.querySelector('strong');
      const updated = lastComputedSheet.byNodeId.get(n.id);
      if (strongEl && updated) strongEl.textContent = updated.formatted;
    });

    document.getElementById('finPropPeriodIdx')?.addEventListener('input', e => {
      n.params.period = Math.max(1, parseInt(e.target.value, 10) || 1);
      refreshCalc();
      const strongEl = container.querySelector('strong');
      const updated = lastComputedSheet.byNodeId.get(n.id);
      if (strongEl && updated) strongEl.textContent = updated.formatted;
    });

    document.getElementById('finPropFormat')?.addEventListener('change', e => {
      n.params.format = e.target.value;
      commitHistory();
      refreshCalc();
      updatePanel();
    });
  }

  function renderFinanceMetricsPanel(container) {
    const sheet = evaluateFinanceSheet();
    const s = sheet.summary;
    const entries = Array.from(sheet.byNodeId.values()).sort((a, b) =>
      a.cellRef.localeCompare(b.cellRef, undefined, { numeric: true })
    );

    if (entries.length === 0) {
      container.innerHTML = `
        <h3>métricas financieras (fx)</h3>
        <div style="padding:12px;border-radius:7px;border:1px dashed var(--line);background:var(--bg2);font-size:9.6px;color:var(--tx2);line-height:1.45">
          Aún no hay celdas financieras en esta planilla.<br><br>
          Añade cualquiera de los <b>54 nodos financieros</b> desde el panel izquierdo o carga un modelo pre-armado para ver balances, márgenes, VAN/TIR y auditoría de fórmulas en vivo.
        </div>
      `;
      return;
    }

    const inFmt = formatFinanceNumber(s.totalInflows, 'currency', null);
    const outFmt = formatFinanceNumber(s.totalOutflows, 'currency', null);
    const netFmt = formatFinanceNumber(s.netBalance, 'currency', null);
    const mgFmt = s.impliedMarginPct !== null ? formatFinanceNumber(s.impliedMarginPct, 'percent', null) : '—';

    let investHighlights = '';
    if (s.npvValue !== null || s.irrValue !== null || s.roiValue !== null) {
      investHighlights = `
        <div class="fin-kpi-grid">
          ${s.npvValue !== null ? `<div class="fin-kpi-card"><span class="fin-kpi-lbl">van / vpn</span><span class="fin-kpi-num ${s.npvValue >= 0 ? 'is-pos' : 'is-neg'}">${escapeHTML(formatFinanceNumber(s.npvValue, 'currency', null))}</span></div>` : ''}
          ${s.irrValue !== null ? `<div class="fin-kpi-card"><span class="fin-kpi-lbl">tir estimada</span><span class="fin-kpi-num is-pos">${escapeHTML(formatFinanceNumber(s.irrValue, 'percent', null))}</span></div>` : ''}
          ${s.roiValue !== null ? `<div class="fin-kpi-card"><span class="fin-kpi-lbl">retorno roi</span><span class="fin-kpi-num ${s.roiValue >= 0 ? 'is-pos' : 'is-neg'}">${escapeHTML(formatFinanceNumber(s.roiValue, 'percent', null))}</span></div>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <h3>métricas de planilla (fx)</h3>
      <div class="fin-metrics-wrap">
        <div class="fin-kpi-grid">
          <div class="fin-kpi-card">
            <span class="fin-kpi-lbl">ingresos / entradas</span>
            <span class="fin-kpi-num is-pos">${escapeHTML(inFmt)}</span>
          </div>
          <div class="fin-kpi-card">
            <span class="fin-kpi-lbl">costos / salidas</span>
            <span class="fin-kpi-num is-neg">${escapeHTML(outFmt)}</span>
          </div>
          <div class="fin-kpi-card is-wide">
            <span class="fin-kpi-lbl">resultado / flujo neto</span>
            <span class="fin-kpi-num ${s.netBalance >= 0 ? 'is-pos' : 'is-neg'}">${escapeHTML(netFmt)} <small style="font-weight:500;font-size:9.5px;color:var(--tx2)">(margen: ${escapeHTML(mgFmt)})</small></span>
          </div>
        </div>

        ${investHighlights}

        <div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);font-size:9px;color:var(--tx2)">
          <span>celdas: <b style="color:var(--tx0)">${s.totalCells}</b></span>
          <span>fórmulas: <b style="color:var(--tx0)">${s.formulaCells}</b></span>
          <span>errores: <b style="color:${s.errorCells ? '#fb7185' : '#4ade80'}">${s.errorCells}</b></span>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <span style="font-size:9.5px;font-weight:700;color:var(--tx1)">libro de celdas en vivo</span>
            <button type="button" class="btn fin-csv-btn" id="btnPanelExportCsv">.csv excel</button>
          </div>
          <div class="fin-sheet-ledger">
            <div class="fin-ledger-head">
              <span>celda</span><span>concepto</span><span>valor</span>
            </div>
            ${entries
              .map(
                e => `
                <div class="fin-ledger-row" data-focus-fin-id="${e.id}" title="${escapeHTML(e.fxText)}">
                  <span class="fin-ledger-cell">${escapeHTML(e.cellRef)}</span>
                  <span class="fin-ledger-name">${escapeHTML(e.title)}</span>
                  <span class="fin-ledger-val">${escapeHTML(e.formatted)}</span>
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-focus-fin-id]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.focusFinId;
        if (typeof setSel === 'function') setSel({ kind: 'node', id });
      });
    });

    document.getElementById('btnPanelExportCsv')?.addEventListener('click', exportFinanceSheetCSV);
  }

  // =========================================================================
  // EXPORTACIÓN .CSV COMPATIBLE CON MICROSOFT EXCEL / GOOGLE SHEETS
  // =========================================================================
  function exportFinanceSheetCSV() {
    const sheet = evaluateFinanceSheet();
    const entries = Array.from(sheet.byNodeId.values()).sort((a, b) =>
      a.cellRef.localeCompare(b.cellRef, undefined, { numeric: true })
    );
    if (!entries.length) {
      if (typeof showToast === 'function') showToast('No hay celdas financieras para exportar', 'info', 1600);
      return;
    }

    const escCsv = val => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Celda', 'Concepto', 'TipoNodo', 'Formula', 'ValorNumerico', 'ValorFormateado'].map(escCsv).join(',')
    ];
    entries.forEach(e => {
      rows.push(
        [e.cellRef, e.title, e.type, e.fxText, e.error ? e.error : e.value.toFixed(4), e.formatted]
          .map(escCsv)
          .join(',')
      );
    });

    const titleRaw = (document.getElementById('projTitle')?.value || 'planilla_financiera').trim();
    const slug = titleRaw.toLowerCase().replace(/[^a-z0-9_-]+/gi, '_') || 'planilla_financiera';
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Planilla exportada a .CSV (Excel)', 'ok', 1800);
  }

  // =========================================================================
  // MODELOS / PLANTILLAS DE PLANILLA FINANCIERA (APARTADO PROPIO)
  // =========================================================================
  function buildFinanceTemplate(templateKey) {
    const N = [];
    const E = [];
    const mk = (type, title, cellRef, val, x, y, extraParams = {}) => {
      const n = createNode(type, title, x, y);
      n.status = 'done';
      n.params = {
        cellRef,
        value: val,
        format: getFinanceNodeDef(type)?.format || 'currency',
        formula: '',
        ...extraParams
      };
      N.push(n);
      return n;
    };
    const wire = (a, b, lbl = '') => E.push(createEdge(a.id, b.id, lbl, 'normal'));

    if (templateKey === 'fin_blanco') {
      return { nodes: [], edges: [], domain: 'finance', title: 'planilla_financiera' };
    }

    if (templateKey === 'fin_flujo_caja') {
      const inv0 = mk('fin_capex', 'Inversión Inicial (t0)', 'A1', 50000, 320, 40);
      const cf1 = mk('fin_cash_in', 'Flujo Neto Año 1', 'B1', 19000, 60, 175);
      const cf2 = mk('fin_cash_in', 'Flujo Neto Año 2', 'B2', 24000, 320, 175);
      const cf3 = mk('fin_cash_in', 'Flujo Neto Año 3', 'B3', 31000, 580, 175);
      const sumCf = mk('fin_sum', 'Flujo Acumulado 3 Años', 'C1', 0, 80, 330);
      const npv = mk('fin_npv', 'VAN Proyecto (12%)', 'C2', 0, 320, 330, { rate: 12 });
      const irr = mk('fin_irr', 'TIR Estimada (%)', 'C3', 0, 560, 330);
      const roi = mk('fin_roi', 'ROI Total (%)', 'D1', 0, 320, 480);

      wire(cf1, sumCf); wire(cf2, sumCf); wire(cf3, sumCf);
      wire(inv0, npv, '-I0'); wire(cf1, npv, 'Año 1'); wire(cf2, npv, 'Año 2'); wire(cf3, npv, 'Año 3');
      wire(inv0, irr, '-I0'); wire(cf1, irr); wire(cf2, irr); wire(cf3, irr);
      wire(inv0, roi, 'Inversión'); wire(sumCf, roi, 'Retorno');
      return { nodes: N, edges: E, domain: 'finance', title: 'evaluacion_van_tir' };
    }

    if (templateKey === 'fin_prestamo') {
      const monto = mk('fin_input', 'Capital del Préstamo', 'A1', 45000, 80, 50);
      const tasa = mk('fin_rate', 'Tasa Anual TNA (%)', 'A2', 11.5, 320, 50);
      const plazo = mk('fin_periods', 'Plazo (Meses)', 'A3', 36, 560, 50);
      const cuota = mk('fin_pmt', 'Cuota Mensual Fija', 'B1', 0, 80, 210);
      const int1 = mk('fin_ipmt', 'Interés Cuota 1', 'B2', 0, 320, 210, { period: 1 });
      const cap1 = mk('fin_ppmt', 'Capital Cuota 1', 'B3', 0, 560, 210, { period: 1 });
      const saldo12 = mk('fin_loan_balance', 'Saldo tras 12 Meses', 'C1', 0, 200, 370, { period: 12 });
      const flujoOp = mk('fin_ocf', 'Flujo Mensual Disponible', 'C2', 2800, 460, 370);
      const dscr = mk('fin_dscr', 'Cobertura Deuda DSCR', 'D1', 0, 330, 515);

      wire(monto, cuota); wire(tasa, cuota); wire(plazo, cuota);
      wire(monto, int1); wire(tasa, int1); wire(plazo, int1);
      wire(monto, cap1); wire(tasa, cap1); wire(plazo, cap1);
      wire(monto, saldo12); wire(tasa, saldo12); wire(plazo, saldo12);
      wire(flujoOp, dscr, 'Flujo'); wire(cuota, dscr, 'Cuota');
      return { nodes: N, edges: E, domain: 'finance', title: 'simulador_credito_frances' };
    }

    // Por defecto: Estado de Resultados Completo (P&L Excel)
    const qty = mk('fin_qty', 'Unidades Vendidas', 'A1', 850, 180, 40);
    const price = mk('fin_unit_price', 'Precio Venta Unit.', 'A2', 140, 440, 40);
    const rev = mk('fin_revenue', 'Ingresos por Ventas', 'B1', 0, 310, 175);
    const cogs = mk('fin_cogs', 'Costo de Ventas (COGS)', 'B2', 44200, 570, 175);
    const gp = mk('fin_gross_profit', 'Utilidad Bruta', 'C1', 0, 310, 315);
    const gm = mk('fin_gross_margin', 'Margen Bruto (%)', 'C2', 0, 60, 315);
    const opex = mk('fin_opex', 'Gastos Operativos OPEX', 'C3', 26500, 570, 315);
    const ebitda = mk('fin_ebitda', 'EBITDA Operativo', 'D1', 0, 310, 455);
    const tax = mk('fin_tax', 'Impuesto Renta (10%)', 'D2', 0, 570, 455, { rate: 10 });
    const net = mk('fin_net_income', 'Utilidad Neta Final', 'E1', 0, 310, 595);
    const nm = mk('fin_net_margin', 'Margen Neto (%)', 'E2', 0, 60, 595);

    wire(qty, rev, 'Q'); wire(price, rev, 'P');
    wire(rev, gp, '+Ventas'); wire(cogs, gp, '-COGS');
    wire(gp, gm); wire(rev, gm);
    wire(gp, ebitda); wire(opex, ebitda, '-OPEX');
    wire(ebitda, tax, 'Base');
    wire(ebitda, net); wire(tax, net, '-Impuesto');
    wire(net, nm); wire(rev, nm);
    return { nodes: N, edges: E, domain: 'finance', title: 'estado_resultados_pnl' };
  }

  function loadFinancePresetOntoCanvas(presetKey) {
    const built = buildFinanceTemplate(presetKey);
    STATE.nodes = built.nodes;
    STATE.edges = built.edges;
    STATE.canvasDomain = 'finance';
    STATE.isBlankCanvas = built.nodes.length === 0;
    STATE.activeProjectId = null;
    STATE.sel = built.nodes[0] ? { kind: 'node', id: built.nodes[0].id } : null;
    STATE.circuit = null;
    STATE.hPtr = -1;
    STATE.history = [];

    const pTitle = document.getElementById('projTitle');
    const pTitleMob = document.getElementById('projTitleMobile');
    if (pTitle) pTitle.value = built.title;
    if (pTitleMob) pTitleMob.value = built.title;

    setCanvasDomain('finance', true);
    evaluateFinanceSheet();
    if (typeof commitHistory === 'function') commitHistory();
    if (typeof markBaselineAsClean === 'function') markBaselineAsClean();
    if (typeof renderAll === 'function') renderAll();
    if (built.nodes.length > 0 && typeof fitView === 'function') {
      requestAnimationFrame(() => fitView());
    }
    if (typeof showToast === 'function') {
      showToast(`Planilla cargada: ${built.title}`, 'ok', 1800);
    }
  }

  // =========================================================================
  // INICIALIZACIÓN DE EVENTOS DE PLANILLA FINANCIERA Y BARRA FX
  // =========================================================================
  function initFinanceSheetFeature() {
    registerFinanceTypesInConfig();
    populateFinancePaletteDOM();

    document.querySelectorAll('[data-ws-domain]').forEach(btn => {
      btn.addEventListener('click', () => {
        setCanvasDomain(btn.dataset.wsDomain, false);
      });
    });

    const btnTogglePresets = document.getElementById('btnFinPresetsToggle');
    const presetsDrawer = document.getElementById('finPresetsDrawer');
    if (btnTogglePresets && presetsDrawer) {
      btnTogglePresets.addEventListener('click', () => {
        presetsDrawer.hidden = !presetsDrawer.hidden;
      });
    }

    document.querySelectorAll('[data-fin-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        loadFinancePresetOntoCanvas(btn.dataset.finPreset);
        if (presetsDrawer) presetsDrawer.hidden = true;
      });
    });

    const cellInput = document.getElementById('finBarCellRef');
    const fxInput = document.getElementById('finBarFormulaInput');
    const curSel = document.getElementById('finCurrencySel');
    const btnCsv = document.getElementById('btnFinExportCsv');

    if (cellInput) {
      cellInput.addEventListener('change', e => {
        const selNode = STATE.sel && STATE.sel.kind === 'node' ? byId(STATE.sel.id) : null;
        if (!selNode || !isFinanceNodeType(selNode.type)) return;
        const clean = String(e.target.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (/^[A-Z]{1,2}\d{1,2}$/.test(clean)) {
          selNode.params.cellRef = clean;
          commitHistory();
          evaluateFinanceSheet();
          renderAll();
        } else {
          syncFormulaBarUI();
        }
      });
    }

    if (fxInput) {
      const applyBarFormulaOrValue = () => {
        const selNode = STATE.sel && STATE.sel.kind === 'node' ? byId(STATE.sel.id) : null;
        if (!selNode || !isFinanceNodeType(selNode.type)) return;
        const raw = fxInput.value.trim();
        if (raw.startsWith('=')) {
          selNode.params.formula = raw;
        } else if (raw === '') {
          selNode.params.formula = '';
          selNode.params.value = 0;
        } else {
          const parsedNum = Number(raw.replace(/,/g, ''));
          if (!Number.isNaN(parsedNum)) {
            selNode.params.formula = '';
            selNode.params.value = parsedNum;
          } else {
            selNode.params.formula = '=' + raw;
          }
        }
        commitHistory();
        evaluateFinanceSheet();
        renderAll();
      };

      fxInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyBarFormulaOrValue();
          fxInput.blur();
        }
      });
      fxInput.addEventListener('change', applyBarFormulaOrValue);
    }

    if (curSel) {
      curSel.addEventListener('change', e => setSheetCurrency(e.target.value));
    }

    if (btnCsv) {
      btnCsv.addEventListener('click', exportFinanceSheetCSV);
    }

    setCanvasDomain(STATE.canvasDomain || 'workflow', true);
  }

  // Registrar tipos inmediatamente al cargar el script
  registerFinanceTypesInConfig();

  window.FINANCE_NODE_LIST = FINANCE_NODE_LIST;
  window.FINANCE_CATEGORIES = FINANCE_CATEGORIES;
  window.isFinanceNodeType = isFinanceNodeType;
  window.getFinanceNodeDef = getFinanceNodeDef;
  window.getFinanceNodeToneClass = getFinanceNodeToneClass;
  window.ensureFinanceNodeDefaults = ensureFinanceNodeDefaults;
  window.evaluateFinanceSheet = evaluateFinanceSheet;
  window.renderFinanceNodeHtml = renderFinanceNodeHtml;
  window.renderFinanceNodeInspector = renderFinanceNodeInspector;
  window.renderFinanceMetricsPanel = renderFinanceMetricsPanel;
  window.buildFinanceTemplate = buildFinanceTemplate;
  window.loadFinancePresetOntoCanvas = loadFinancePresetOntoCanvas;
  window.exportFinanceSheetCSV = exportFinanceSheetCSV;
  window.isFinanceWorkspaceActive = isFinanceWorkspaceActive;
  window.setCanvasDomain = setCanvasDomain;
  window.setWorkspaceDomain = (domain, opts) => setCanvasDomain(domain, Boolean(opts && opts.silent));
  window.syncFormulaBarUI = syncFormulaBarUI;
  window.setSheetCurrency = setSheetCurrency;
  window.initFinanceSheetFeature = initFinanceSheetFeature;
})();
