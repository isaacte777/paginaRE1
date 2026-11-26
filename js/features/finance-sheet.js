// FINANCE SHEET: Motor Financiero Reactivo (Nodos financieros, gráficas de ganancia/pérdida, evaluador DAG, barra fx y métricas)

(function () {
  const CURRENCY_CONFIG = {
    USD: { symbol: '$', decimals: 2, code: 'USD' },
    PYG: { symbol: '₲ ', decimals: 0, code: 'PYG' },
    EUR: { symbol: '€', decimals: 2, code: 'EUR' },
    ARS: { symbol: '$', decimals: 2, code: 'ARS' },
    BRL: { symbol: 'R$', decimals: 2, code: 'BRL' }
  };

  const FIN_SVGS = {
    chart: '<svg width="13" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="14" x2="23" y2="14"/><rect x="3" y="6" width="4" height="8"/><rect x="10" y="2" width="4" height="12"/><polyline points="16,10 19,5 22,7"/></svg>',
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
    { id: 'graficas_pnl', label: 'gráficas y ganancia / pérdida', cardTag: 'resultado', icon: FIN_SVGS.chart },
    { id: 'entradas', label: 'celdas y datos base', cardTag: 'dato base', icon: FIN_SVGS.cell },
    { id: 'operaciones', label: 'operaciones y cálculos', cardTag: 'cálculo', icon: FIN_SVGS.sum },
    { id: 'resultados', label: 'estado resultados (p&l)', cardTag: 'p&l', icon: FIN_SVGS.pnl },
    { id: 'flujo_caja', label: 'flujo de caja y liquidez', cardTag: 'flujo', icon: FIN_SVGS.cash },
    { id: 'inversion', label: 'inversión (van · tir · roi)', cardTag: 'inversión', icon: FIN_SVGS.inv },
    { id: 'credito', label: 'préstamos y amortización', cardTag: 'crédito', icon: FIN_SVGS.loan },
    { id: 'ratios', label: 'ratios y equilibrio', cardTag: 'ratio', icon: FIN_SVGS.ratio },
    { id: 'comercial', label: 'impuestos, precios y nómina', cardTag: 'comercial', icon: FIN_SVGS.comm }
  ];

  // 60 Nodos Financieros (54 de cálculo + 6 gráficas/indicadores de ganancia y pérdida)
  const FINANCE_NODE_LIST = [
    // 0. GRÁFICAS Y DIAGNÓSTICO DE GANANCIA / PÉRDIDA (6)
    { type: 'fin_verdict_kpi', cat: 'graficas_pnl', fn: 'veredicto_resultado()', title: 'Veredicto Ganancia / Pérdida', format: 'currency', tone: 'chart', isChart: true, defaultVal: 0, fxHint: 'Diagnóstico Neto' },
    { type: 'fin_chart_pnl', cat: 'graficas_pnl', fn: 'grafica_ganancia_perdida()', title: 'Gráfica Ingresos vs Costos', format: 'currency', tone: 'chart', isChart: true, defaultVal: 0, fxHint: 'Comparativa P&L' },
    { type: 'fin_chart_waterfall', cat: 'graficas_pnl', fn: 'grafica_cascada_pnl()', title: 'Cascada de Rentabilidad', format: 'currency', tone: 'chart', isChart: true, defaultVal: 0, fxHint: 'Puente Ingresos→Neto' },
    { type: 'fin_chart_cashflow', cat: 'graficas_pnl', fn: 'grafica_flujos_barras()', title: 'Barras de Flujo (+ / -)', format: 'currency', tone: 'chart', isChart: true, defaultVal: 0, fxHint: 'Saldos + vs -' },
    { type: 'fin_chart_margin', cat: 'graficas_pnl', fn: 'termometro_margen()', title: 'Termómetro de Rentabilidad', format: 'percent', tone: 'chart', isChart: true, defaultVal: 0, rateParam: 25, fxHint: 'Margen % vs Meta' },
    { type: 'fin_chart_breakdown', cat: 'graficas_pnl', fn: 'anillo_ingresos_costos()', title: 'Anillo Costos vs Ganancia', format: 'percent', tone: 'chart', isChart: true, defaultVal: 0, fxHint: 'Peso Costo/Utilidad' },

    // 1. CELDAS Y DATOS BASE (7)
    { type: 'fin_input', cat: 'entradas', fn: 'celda_valor()', title: 'Celda de Valor', format: 'currency', tone: 'input', defaultVal: 10000, fxHint: 'Valor base' },
    { type: 'fin_rate', cat: 'entradas', fn: 'tasa_porcentaje()', title: 'Tasa / Interés (%)', format: 'percent', tone: 'input', defaultVal: 12, fxHint: 'Tasa %' },
    { type: 'fin_periods', cat: 'entradas', fn: 'periodos_plazo()', title: 'Plazo / Periodos', format: 'number', tone: 'input', defaultVal: 12, fxHint: 'Nper' },
    { type: 'fin_qty', cat: 'entradas', fn: 'cantidad_unidades()', title: 'Cantidad / Unidades', format: 'number', tone: 'input', defaultVal: 250, fxHint: 'Volumen Q' },
    { type: 'fin_unit_price', cat: 'entradas', fn: 'precio_unitario()', title: 'Precio Unitario', format: 'currency', tone: 'input', defaultVal: 120, fxHint: 'Precio P' },
    { type: 'fin_fx_rate', cat: 'entradas', fn: 'tipo_cambio()', title: 'Conversión Divisa', format: 'currency', tone: 'formula', defaultVal: 1, rateParam: 7500, fxHint: '=Monto × TC' },
    { type: 'fin_formula', cat: 'entradas', fn: 'formula_libre()', title: 'Fórmula Libre', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=SUMA(entradas)' },

    // 2. OPERACIONES Y CÁLCULOS (8)
    { type: 'fin_sum', cat: 'operaciones', fn: 'suma_rango()', title: 'SUMA Total', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=SUMA(rango)' },
    { type: 'fin_subtract', cat: 'operaciones', fn: 'resta_diferencia()', title: 'Resta / Diferencia', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=A - B' },
    { type: 'fin_multiply', cat: 'operaciones', fn: 'producto_mult()', title: 'PRODUCTO (×)', format: 'currency', tone: 'formula', defaultVal: 1, fxHint: '=PRODUCTO(A;B)' },
    { type: 'fin_divide', cat: 'operaciones', fn: 'division_ratio()', title: 'División / Cociente', format: 'number', tone: 'formula', defaultVal: 0, fxHint: '=A / B' },
    { type: 'fin_average', cat: 'operaciones', fn: 'promedio_media()', title: 'PROMEDIO', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=PROMEDIO(rango)' },
    { type: 'fin_min_max', cat: 'operaciones', fn: 'min_max_rango()', title: 'MÁX / MÍN Rango', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=MAX(rango)' },
    { type: 'fin_if_cond', cat: 'operaciones', fn: 'si_condicional()', title: 'Condicional SI()', format: 'currency', tone: 'formula', defaultVal: 0, fxHint: '=SI(A>=Meta)' },
    { type: 'fin_variance_pct', cat: 'operaciones', fn: 'variacion_pct()', title: 'Variación Δ%', format: 'percent', tone: 'ratio', defaultVal: 0, fxHint: '=(Act-Base)/Base' },

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

      case 'fin_verdict_kpi':
      case 'fin_chart_pnl':
      case 'fin_chart_waterfall':
      case 'fin_chart_cashflow':
      case 'fin_chart_margin':
      case 'fin_chart_breakdown': {
        if (upstreamEntries.length > 0) {
          let upIn = 0;
          let upOut = 0;
          let explicitRes = null;
          const negTypes = new Set([
            'fin_cogs', 'fin_opex', 'fin_depreciation', 'fin_tax',
            'fin_cash_out', 'fin_capex', 'fin_payroll_cost', 'fin_pmt'
          ]);
          const netTypes = new Set(['fin_net_income', 'fin_fcf', 'fin_ebit', 'fin_ebitda', 'fin_ocf', 'fin_npv']);
          upstreamEntries.forEach(u => {
            if (netTypes.has(u.nodeType)) explicitRes = u.value;
            else if (negTypes.has(u.nodeType)) upOut += Math.abs(u.value);
            else if (u.value < 0) upOut += Math.abs(u.value);
            else upIn += u.value;
          });
          const netVal = explicitRes !== null ? explicitRes : (upIn - upOut);
          if (node.type === 'fin_chart_margin' || node.type === 'fin_chart_breakdown') {
            const mg = upIn > 0 ? (netVal / upIn) * 100 : (explicitRes !== null ? explicitRes : 0);
            return { value: mg, fxAuto: `Margen (${upstreamEntries.map(u => u.ref).join(',')})` };
          }
          return { value: netVal, fxAuto: `Neto (${upstreamEntries.map(u => u.ref).join(',')})` };
        }
        return { value: baseVal, fxAuto: 'Resumen planilla' };
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

    // Calcular métricas financieras agregadas de la planilla (excluyendo nodos puramente gráficos para no duplicar montos)
    const calcFinNodes = finNodes.filter(n => !getFinanceNodeDef(n.type)?.isChart);
    let totalInflows = 0;
    let totalOutflows = 0;
    let explicitNet = null;
    let explicitNetPriority = 99;
    let npvValue = null;
    let irrValue = null;
    let roiValue = null;

    const inflowTypes = new Set(['fin_revenue', 'fin_cash_in']);
    const outflowTypes = new Set([
      'fin_cogs', 'fin_opex', 'fin_depreciation', 'fin_tax',
      'fin_cash_out', 'fin_capex', 'fin_payroll_cost', 'fin_pmt'
    ]);
    const netPriorityMap = {
      fin_net_income: 1,
      fin_fcf: 2,
      fin_ebit: 3,
      fin_ebitda: 4,
      fin_ocf: 5,
      fin_gross_profit: 6
    };

    calcFinNodes.forEach(n => {
      const res = byNodeId.get(n.id);
      if (!res || res.error) return;
      if (inflowTypes.has(n.type)) totalInflows += res.value;
      if (outflowTypes.has(n.type)) totalOutflows += Math.abs(res.value);
      if (netPriorityMap[n.type] && netPriorityMap[n.type] <= explicitNetPriority) {
        explicitNet = res.value;
        explicitNetPriority = netPriorityMap[n.type];
      }
      if (n.type === 'fin_npv') npvValue = res.value;
      if (n.type === 'fin_irr') irrValue = res.value;
      if (n.type === 'fin_roi') roiValue = res.value;
    });

    // Si la planilla usa celdas libres (fin_input / fin_formula / fin_subtract) sin tipos P&L dedicados, inferir entradas vs salidas
    if (totalInflows === 0 && totalOutflows === 0 && calcFinNodes.length > 0) {
      calcFinNodes.forEach(n => {
        const res = byNodeId.get(n.id);
        const def = getFinanceNodeDef(n.type);
        if (!res || res.error || def?.format === 'percent' || def?.format === 'multiple' || def?.format === 'months') return;
        if (n.type === 'fin_qty' || n.type === 'fin_unit_price' || n.type === 'fin_periods' || n.type === 'fin_rate') return;
        const lbl = String(n.text || '').toLowerCase();
        if (n.type === 'fin_subtract' && explicitNet === null) {
          explicitNet = res.value;
          return;
        }
        if (res.value < 0 || /\b(costo|coste|gasto|egreso|pago|salida|impuesto|deuda|cuota|perdida|inversion)\b/.test(lbl)) {
          totalOutflows += Math.abs(res.value);
        } else if ((incoming.get(n.id) || []).length === 0 || /\b(ingreso|venta|cobro|entrada|facturacion|abono)\b/.test(lbl)) {
          totalInflows += Math.max(0, res.value);
        }
      });
    }

    const netBalance =
      explicitNet !== null
        ? explicitNet
        : npvValue !== null && totalInflows === 0
          ? npvValue
          : totalInflows - totalOutflows;

    const impliedMarginPct =
      totalInflows > 0 ? (netBalance / totalInflows) * 100 : roiValue !== null ? roiValue : null;

    const coverageRatio =
      totalOutflows > 0 ? totalInflows / totalOutflows : totalInflows > 0 ? 9.99 : null;

    const verdict =
      netBalance > 0.005 ? 'profit' : netBalance < -0.005 ? 'loss' : 'breakeven';

    // Actualizar valores mostrados de nodos gráficos sin conexiones entrantes para reflejar el diagnóstico global
    finNodes.forEach(n => {
      const def = getFinanceNodeDef(n.type);
      if (!def?.isChart) return;
      const entry = byNodeId.get(n.id);
      if (!entry) return;
      const scope = n.params?.dataScope || 'auto';
      if (scope === 'sheet' || (scope === 'auto' && entry.upstreamRefs.length === 0)) {
        const isPctChart = n.type === 'fin_chart_margin' || n.type === 'fin_chart_breakdown';
        entry.value = isPctChart ? (impliedMarginPct ?? 0) : netBalance;
        entry.formatted = formatFinanceNumber(entry.value, isPctChart ? 'percent' : 'currency', null);
        entry.fxText = 'Resumen planilla';
      }
    });

    lastComputedSheet = {
      byNodeId,
      byCellRef,
      summary: {
        totalCells: calcFinNodes.length,
        chartCells: finNodes.length - calcFinNodes.length,
        formulaCells,
        errorCells,
        totalInflows,
        totalOutflows,
        netBalance,
        impliedMarginPct,
        coverageRatio,
        verdict,
        npvValue,
        irrValue,
        roiValue
      }
    };

    syncFormulaBarUI();
    return lastComputedSheet;
  }

  // =========================================================================
  // MOTOR DE EXTRACCIÓN Y GRÁFICAS FINANCIERAS DE GANANCIA / PÉRDIDA (SVG)
  // =========================================================================
  function compactMoney(val) {
    const num = Number(val) || 0;
    const cur = getSheetCurrency();
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 1e6) return `${sign}${cur.symbol}${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}${cur.symbol}${(abs / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}k`;
    return formatFinanceNumber(num, 'currency', null);
  }

  function extractFinanceChartDataset(n) {
    const s = lastComputedSheet.summary || {};
    const scope = n.params?.dataScope || 'auto';
    const negTypes = new Set([
      'fin_cogs', 'fin_opex', 'fin_depreciation', 'fin_tax',
      'fin_cash_out', 'fin_capex', 'fin_payroll_cost', 'fin_pmt'
    ]);
    const netTypes = new Set([
      'fin_net_income', 'fin_fcf', 'fin_ebit', 'fin_ebitda', 'fin_ocf', 'fin_gross_profit', 'fin_npv'
    ]);
    const skipRatioTypes = new Set([
      'fin_gross_margin', 'fin_net_margin', 'fin_roe', 'fin_roa', 'fin_irr',
      'fin_roi', 'fin_dscr', 'fin_liquidity', 'fin_payback', 'fin_runway',
      'fin_rate', 'fin_periods', 'fin_qty', 'fin_unit_price'
    ]);

    let sourceNodes = [];
    if (scope !== 'sheet' && typeof STATE !== 'undefined' && Array.isArray(STATE.edges)) {
      const upIds = STATE.edges.filter(e => e.to === n.id).map(e => e.from);
      sourceNodes = upIds
        .map(id => (STATE.nodes || []).find(x => x.id === id))
        .filter(x => x && isFinanceNodeType(x.type) && !getFinanceNodeDef(x.type)?.isChart);
    }

    const usingConnected = sourceNodes.length > 0;
    if (!usingConnected && scope !== 'connected' && typeof STATE !== 'undefined' && Array.isArray(STATE.nodes)) {
      sourceNodes = STATE.nodes.filter(
        x => x.id !== n.id && isFinanceNodeType(x.type) && !getFinanceNodeDef(x.type)?.isChart
      );
    }

    let inflows = 0;
    let outflows = 0;
    let explicitNet = null;
    let explicitPriority = 99;
    const netPrio = { fin_net_income: 1, fin_fcf: 2, fin_ebit: 3, fin_ebitda: 4, fin_ocf: 5, fin_npv: 6, fin_gross_profit: 7 };
    const items = [];

    sourceNodes.forEach(sn => {
      const entry = lastComputedSheet.byNodeId.get(sn.id);
      if (!entry || entry.error) return;
      if (!usingConnected && skipRatioTypes.has(sn.type)) return;

      const lbl = String(sn.text || entry.title || sn.params?.cellRef || 'Ítem').trim();
      const lower = lbl.toLowerCase();
      let role = 'neutral';
      let signedVal = entry.value;

      if (netTypes.has(sn.type)) {
        role = 'net';
        const pr = netPrio[sn.type] || 10;
        if (pr <= explicitPriority) {
          explicitNet = entry.value;
          explicitPriority = pr;
        }
      } else if (negTypes.has(sn.type) || /\b(costo|coste|gasto|egreso|pago|impuesto|capex|cuota|salida)\b/.test(lower)) {
        role = 'outflow';
        signedVal = -Math.abs(entry.value);
        outflows += Math.abs(entry.value);
      } else if (entry.value < 0) {
        role = 'outflow';
        signedVal = entry.value;
        outflows += Math.abs(entry.value);
      } else if (
        usingConnected ||
        sn.type === 'fin_revenue' ||
        sn.type === 'fin_cash_in' ||
        /\b(ingreso|venta|cobro|entrada|flujo)\b/.test(lower)
      ) {
        role = 'inflow';
        signedVal = Math.abs(entry.value);
        inflows += Math.abs(entry.value);
      } else if (sn.type === 'fin_input' && sourceNodes.length <= 6) {
        role = 'inflow';
        signedVal = Math.abs(entry.value);
        inflows += Math.abs(entry.value);
      }

      if (role !== 'neutral') {
        items.push({
          ref: entry.cellRef,
          label: lbl,
          shortLabel: lbl.length > 12 ? lbl.slice(0, 11) + '…' : lbl,
          raw: entry.value,
          signed: signedVal,
          role
        });
      }
    });

    if (!usingConnected && inflows === 0 && outflows === 0) {
      inflows = s.totalInflows || 0;
      outflows = s.totalOutflows || 0;
      if (explicitNet === null && typeof s.netBalance === 'number') explicitNet = s.netBalance;
    }

    const net = explicitNet !== null ? explicitNet : inflows - outflows;
    const marginPct =
      inflows > 0
        ? (net / inflows) * 100
        : !usingConnected && typeof s.impliedMarginPct === 'number'
          ? s.impliedMarginPct
          : net > 0
            ? 100
            : net < 0
              ? -100
              : 0;

    const coverage = outflows > 0 ? inflows / outflows : inflows > 0 ? 9.9 : 1;
    const verdict = net > 0.005 ? 'profit' : net < -0.005 ? 'loss' : 'breakeven';
    const verdictLabel =
      verdict === 'profit' ? 'GANANCIA' : verdict === 'loss' ? 'PÉRDIDA' : 'EQUILIBRIO';
    const verdictIcon = verdict === 'profit' ? '▲' : verdict === 'loss' ? '▼' : '●';

    return {
      usingConnected,
      sourceCount: sourceNodes.length,
      inflows,
      outflows,
      net,
      marginPct,
      coverage,
      verdict,
      verdictLabel,
      verdictIcon,
      items
    };
  }

  function renderFinanceChartCardHtml(n, def, evalEntry) {
    const d = extractFinanceChartDataset(n);
    const scopeLbl = d.usingConnected ? `← ${d.sourceCount} celdas` : 'planilla activa';
    const badgeCls =
      d.verdict === 'profit' ? 'is-profit' : d.verdict === 'loss' ? 'is-loss' : 'is-even';
    const netSignedFmt =
      (d.net > 0 ? '+' : '') + formatFinanceNumber(d.net, 'currency', null);
    const mgFmt = `${d.marginPct >= 0 ? '+' : ''}${d.marginPct.toFixed(1)}%`;
    const customSub = n.params?.subtitle ? escapeHTML(n.params.subtitle) : '';

    // 1. TARJETA EJECUTIVA DE VEREDICTO (GANANCIA / PÉRDIDA / EQUILIBRIO)
    if (n.type === 'fin_verdict_kpi') {
      const maxBar = Math.max(1, d.inflows, d.outflows, Math.abs(d.net));
      const inPct = Math.round(clamp((d.inflows / maxBar) * 100, 3, 100));
      const outPct = Math.round(clamp((d.outflows / maxBar) * 100, 3, 100));
      return `
        <div class="fin-card-top">
          <span class="fin-cell-pill">${escapeHTML(evalEntry.cellRef)}</span>
          <span class="fin-verdict-pill ${badgeCls}">${d.verdictIcon} ${d.verdictLabel}</span>
        </div>
        <div class="fin-card-title text">${escapeHTML(n.text || def.title)}</div>
        <div class="fin-verdict-hero ${badgeCls}">
          <span class="fin-verdict-amount">${escapeHTML(netSignedFmt)}</span>
          <span class="fin-verdict-mg">${escapeHTML(mgFmt)}</span>
        </div>
        <div class="fin-verdict-bars">
          <div class="fin-vbar-row">
            <span>ingresos</span>
            <div class="fin-vbar-track"><i class="is-in" style="width:${inPct}%"></i></div>
            <b>${escapeHTML(compactMoney(d.inflows))}</b>
          </div>
          <div class="fin-vbar-row">
            <span>egresos</span>
            <div class="fin-vbar-track"><i class="is-out" style="width:${outPct}%"></i></div>
            <b>${escapeHTML(compactMoney(d.outflows))}</b>
          </div>
        </div>
        <div class="fin-card-foot">
          <span class="fin-card-fx">${customSub || `cobertura ${d.coverage.toFixed(2)}x`}</span>
          <span class="fin-card-refs">${escapeHTML(scopeLbl)}</span>
        </div>
      `;
    }

    let svgHtml = '';
    let footerLeft = customSub || `margen ${mgFmt}`;

    // 2. GRÁFICA COMPARATIVA INGRESOS VS COSTOS VS RESULTADO NETO
    if (n.type === 'fin_chart_pnl') {
      const maxRef = Math.max(1, d.inflows, d.outflows, Math.abs(d.net));
      const wMax = 148;
      const wIn = Math.max(4, Math.round((d.inflows / maxRef) * wMax));
      const wOut = Math.max(4, Math.round((d.outflows / maxRef) * wMax));
      const wNet = Math.max(4, Math.round((Math.abs(d.net) / maxRef) * wMax));
      const netColor = d.verdict === 'profit' ? '#4ade80' : d.verdict === 'loss' ? '#fb7185' : '#fbbf24';

      svgHtml = `
        <svg class="fin-chart-svg" viewBox="0 0 264 108" aria-hidden="true">
          <line x1="68" y1="8" x2="68" y2="98" stroke="#2a3138" stroke-width="1"/>
          <line x1="142" y1="8" x2="142" y2="98" stroke="#1d2329" stroke-width="1" stroke-dasharray="2 3"/>
          <line x1="216" y1="8" x2="216" y2="98" stroke="#1d2329" stroke-width="1" stroke-dasharray="2 3"/>

          <text x="4" y="26" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">Ingresos</text>
          <rect x="69" y="15" width="${wIn}" height="15" rx="3" fill="#4ade80" fill-opacity="0.86"/>
          <text x="${Math.min(220, 74 + wIn)}" y="26" fill="#dcfce7" font-size="8.4" font-weight="700" font-family="JetBrains Mono">${escapeHTML(compactMoney(d.inflows))}</text>

          <text x="4" y="57" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">Costos</text>
          <rect x="69" y="46" width="${wOut}" height="15" rx="3" fill="#fb7185" fill-opacity="0.86"/>
          <text x="${Math.min(220, 74 + wOut)}" y="57" fill="#ffe4e6" font-size="8.4" font-weight="700" font-family="JetBrains Mono">${escapeHTML(compactMoney(d.outflows))}</text>

          <text x="4" y="88" fill="#cbd5e1" font-size="8.5" font-weight="700" font-family="JetBrains Mono">${d.verdict === 'loss' ? 'Pérdida' : 'Ganancia'}</text>
          <rect x="69" y="77" width="${wNet}" height="15" rx="3" fill="${netColor}"/>
          <text x="${Math.min(214, 74 + wNet)}" y="88" fill="${netColor}" font-size="8.6" font-weight="700" font-family="JetBrains Mono">${escapeHTML((d.net > 0 ? '+' : '') + compactMoney(d.net))}</text>
        </svg>
      `;
      const costWeight = d.inflows > 0 ? `${Math.round((d.outflows / d.inflows) * 100)}% costo` : 'balance directo';
      footerLeft = customSub || `${mgFmt} · ${costWeight}`;
    }

    // 3. CASCADA DE RENTABILIDAD (WATERFALL P&L)
    else if (n.type === 'fin_chart_waterfall') {
      const flowSteps = d.items.filter(i => i.role !== 'net').slice(0, 4);
      let steps = [];
      if (flowSteps.length >= 2) {
        let running = 0;
        flowSteps.forEach(st => {
          const prev = running;
          running += st.signed;
          steps.push({ lbl: st.ref || st.shortLabel.slice(0, 6), from: prev, to: running, val: st.signed, kind: st.signed >= 0 ? 'pos' : 'neg' });
        });
        steps.push({ lbl: 'Neto', from: 0, to: d.net, val: d.net, kind: 'total' });
      } else {
        steps = [
          { lbl: 'Ventas', from: 0, to: d.inflows, val: d.inflows, kind: 'pos' },
          { lbl: 'Costos', from: d.inflows, to: d.net, val: -d.outflows, kind: 'neg' },
          { lbl: 'Neto', from: 0, to: d.net, val: d.net, kind: 'total' }
        ];
      }

      const allVals = [0, ...steps.flatMap(s => [s.from, s.to])];
      const minV = Math.min(...allVals);
      const maxV = Math.max(1, ...allVals);
      const span = Math.max(1, maxV - minV);
      const yTop = 16;
      const plotH = 68;
      const toY = v => yTop + plotH - ((v - minV) / span) * plotH;
      const zeroY = toY(0);
      const colSlot = 244 / steps.length;
      const barW = Math.min(34, Math.max(18, colSlot - 12));

      const barsSvg = steps
        .map((st, idx) => {
          const x = 12 + idx * colSlot + (colSlot - barW) / 2;
          const y1 = toY(st.from);
          const y2 = toY(st.to);
          const rectY = Math.min(y1, y2);
          const rectH = Math.max(3, Math.abs(y2 - y1));
          const fill =
            st.kind === 'total'
              ? d.net >= 0
                ? '#38bdf8'
                : '#f43f5e'
              : st.kind === 'pos'
                ? '#4ade80'
                : '#fb7185';
          const conn =
            idx < steps.length - 1
              ? `<line x1="${x + barW}" y1="${y2.toFixed(1)}" x2="${(12 + (idx + 1) * colSlot + (colSlot - barW) / 2).toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#475569" stroke-width="0.9" stroke-dasharray="2 2"/>`
              : '';
          return `
            ${conn}
            <rect x="${x.toFixed(1)}" y="${rectY.toFixed(1)}" width="${barW.toFixed(1)}" height="${rectH.toFixed(1)}" rx="2.5" fill="${fill}" fill-opacity="0.9"/>
            <text x="${(x + barW / 2).toFixed(1)}" y="${Math.max(10, rectY - 3).toFixed(1)}" text-anchor="middle" fill="#cbd5e1" font-size="7.4" font-family="JetBrains Mono">${escapeHTML(compactMoney(st.val))}</text>
            <text x="${(x + barW / 2).toFixed(1)}" y="99" text-anchor="middle" fill="#94a3b8" font-size="7.6" font-family="JetBrains Mono">${escapeHTML(st.lbl)}</text>
          `;
        })
        .join('');

      svgHtml = `
        <svg class="fin-chart-svg" viewBox="0 0 264 106" aria-hidden="true">
          <line x1="8" y1="${zeroY.toFixed(1)}" x2="256" y2="${zeroY.toFixed(1)}" stroke="#334155" stroke-width="1"/>
          ${barsSvg}
        </svg>
      `;
      footerLeft = customSub || `puente neto ${compactMoney(d.net)}`;
    }

    // 4. BARRAS DE FLUJO POSITIVO VS NEGATIVO (EJE CERO)
    else if (n.type === 'fin_chart_cashflow') {
      const series =
        d.items.length >= 2
          ? d.items.slice(0, 6).map(i => ({ lbl: i.ref, val: i.role === 'outflow' ? -Math.abs(i.raw) : i.raw }))
          : [
              { lbl: 'Entradas', val: d.inflows },
              { lbl: 'Salidas', val: -d.outflows },
              { lbl: 'Saldo', val: d.net }
            ];
      const maxAbs = Math.max(1, ...series.map(s => Math.abs(s.val)));
      const midY = 52;
      const halfH = 34;
      const slot = 240 / series.length;
      const bw = Math.min(30, Math.max(14, slot - 10));
      let posCount = 0;
      let negCount = 0;

      const cols = series
        .map((s, idx) => {
          if (s.val >= 0) posCount++;
          else negCount++;
          const h = Math.max(3, (Math.abs(s.val) / maxAbs) * halfH);
          const x = 14 + idx * slot + (slot - bw) / 2;
          const y = s.val >= 0 ? midY - h : midY;
          const color = s.val >= 0 ? '#4ade80' : '#fb7185';
          const lblY = s.val >= 0 ? Math.max(10, y - 3) : Math.min(92, y + h + 9);
          return `
            <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2.5" fill="${color}" fill-opacity="0.88"/>
            <text x="${(x + bw / 2).toFixed(1)}" y="${lblY.toFixed(1)}" text-anchor="middle" fill="${color}" font-size="7.3" font-weight="700" font-family="JetBrains Mono">${escapeHTML(compactMoney(s.val))}</text>
            <text x="${(x + bw / 2).toFixed(1)}" y="102" text-anchor="middle" fill="#94a3b8" font-size="7.5" font-family="JetBrains Mono">${escapeHTML(s.lbl)}</text>
          `;
        })
        .join('');

      svgHtml = `
        <svg class="fin-chart-svg" viewBox="0 0 264 106" aria-hidden="true">
          <line x1="8" y1="${midY}" x2="256" y2="${midY}" stroke="#475569" stroke-width="1"/>
          <text x="10" y="${midY - 3}" fill="#64748b" font-size="7" font-family="JetBrains Mono">$0</text>
          ${cols}
        </svg>
      `;
      footerLeft = customSub || `+${posCount} favor · -${negCount} contra`;
    }

    // 5. TERMÓMETRO / VELOCÍMETRO DE RENTABILIDAD Y MARGEN (%)
    else if (n.type === 'fin_chart_margin') {
      const targetMg = Number(n.params?.rate ?? 25);
      const clampedMg = clamp(d.marginPct, -50, 50);
      const norm = (clampedMg + 50) / 100; // 0 = -50%, 0.5 = 0% (equilibrio), 1 = +50%
      const angle = Math.PI * (1 - norm);
      const cx = 132;
      const cy = 78;
      const r = 54;
      const nx = cx + Math.cos(angle) * (r - 8);
      const ny = cy - Math.sin(angle) * (r - 8);

      const targetNorm = (clamp(targetMg, -50, 50) + 50) / 100;
      const tAngle = Math.PI * (1 - targetNorm);
      const tx1 = cx + Math.cos(tAngle) * (r - 5);
      const ty1 = cy - Math.sin(tAngle) * (r - 5);
      const tx2 = cx + Math.cos(tAngle) * (r + 5);
      const ty2 = cy - Math.sin(tAngle) * (r + 5);
      const needleColor = d.marginPct >= targetMg ? '#4ade80' : d.marginPct >= 0 ? '#fbbf24' : '#fb7185';

      svgHtml = `
        <svg class="fin-chart-svg" viewBox="0 0 264 106" aria-hidden="true">
          <path d="M 78 78 A 54 54 0 0 1 132 24" fill="none" stroke="#fb7185" stroke-opacity="0.45" stroke-width="10" stroke-linecap="butt"/>
          <path d="M 132 24 A 54 54 0 0 1 186 78" fill="none" stroke="#4ade80" stroke-opacity="0.45" stroke-width="10" stroke-linecap="butt"/>
          <line x1="132" y1="18" x2="132" y2="30" stroke="#e2e8f0" stroke-width="1.5"/>
          <text x="132" y="14" text-anchor="middle" fill="#94a3b8" font-size="7.2" font-family="JetBrains Mono">0% eq.</text>
          <line x1="${tx1.toFixed(1)}" y1="${ty1.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" stroke="#38bdf8" stroke-width="2"/>
          <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${needleColor}" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="${cx}" cy="${cy}" r="4.2" fill="${needleColor}"/>
          <text x="68" y="92" text-anchor="end" fill="#fb7185" font-size="7.5" font-family="JetBrains Mono">pérdida</text>
          <text x="196" y="92" text-anchor="start" fill="#4ade80" font-size="7.5" font-family="JetBrains Mono">ganancia</text>
          <text x="132" y="98" text-anchor="middle" fill="${needleColor}" font-size="12" font-weight="700" font-family="JetBrains Mono">${escapeHTML(mgFmt)}</text>
        </svg>
      `;
      footerLeft = customSub || `meta: ${targetMg}% · ${d.marginPct >= targetMg ? 'cumplida' : d.marginPct >= 0 ? 'bajo meta' : 'en pérdida'}`;
    }

    // 6. ANILLO DISTRIBUCIÓN COSTOS VS GANANCIA (DONUT FINANCIERO)
    else {
      const r = 34;
      const circ = 2 * Math.PI * r;
      const isLoss = d.net < 0;
      const baseTotal = Math.max(1, isLoss ? d.outflows : d.inflows);
      const profitShare = isLoss ? 0 : clamp(d.net / baseTotal, 0, 1);
      const costShare = isLoss ? clamp(d.inflows / baseTotal, 0, 1) : clamp(d.outflows / baseTotal, 0, 1);
      const lossShare = isLoss ? clamp(Math.abs(d.net) / baseTotal, 0, 1) : 0;

      const seg1 = (isLoss ? costShare : profitShare) * circ;
      const seg2 = (isLoss ? lossShare : costShare) * circ;
      const c1 = isLoss ? '#fbbf24' : '#4ade80';
      const c2 = '#fb7185';
      const centerTop = isLoss ? 'DÉFICIT' : 'RETENIDO';
      const centerVal = isLoss
        ? `-${Math.round(lossShare * 100)}%`
        : `${Math.round(profitShare * 100)}%`;

      svgHtml = `
        <svg class="fin-chart-svg" viewBox="0 0 264 106" aria-hidden="true">
          <circle cx="62" cy="53" r="${r}" fill="none" stroke="#1e252c" stroke-width="11"/>
          <circle cx="62" cy="53" r="${r}" fill="none" stroke="${c1}" stroke-width="11"
            stroke-dasharray="${seg1.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 62 53)"/>
          <circle cx="62" cy="53" r="${r}" fill="none" stroke="${c2}" stroke-width="11"
            stroke-dasharray="${seg2.toFixed(1)} ${circ.toFixed(1)}" stroke-dashoffset="${(-seg1).toFixed(1)}" transform="rotate(-90 62 53)"/>
          <text x="62" y="49" text-anchor="middle" fill="#94a3b8" font-size="6.6" font-family="JetBrains Mono">${centerTop}</text>
          <text x="62" y="61" text-anchor="middle" fill="${isLoss ? '#fb7185' : '#4ade80'}" font-size="10.5" font-weight="700" font-family="JetBrains Mono">${centerVal}</text>

          <rect x="118" y="24" width="7" height="7" rx="1.5" fill="#4ade80"/>
          <text x="130" y="30.5" fill="#cbd5e1" font-size="8" font-family="JetBrains Mono">Ingresos: ${escapeHTML(compactMoney(d.inflows))}</text>

          <rect x="118" y="47" width="7" height="7" rx="1.5" fill="#fb7185"/>
          <text x="130" y="53.5" fill="#cbd5e1" font-size="8" font-family="JetBrains Mono">Costos: ${escapeHTML(compactMoney(d.outflows))}</text>

          <rect x="118" y="70" width="7" height="7" rx="1.5" fill="${isLoss ? '#f43f5e' : '#38bdf8'}"/>
          <text x="130" y="76.5" fill="${isLoss ? '#fda4af' : '#bae6fd'}" font-size="8.2" font-weight="700" font-family="JetBrains Mono">${isLoss ? 'Pérdida' : 'Ganancia'}: ${escapeHTML(compactMoney(d.net))}</text>
        </svg>
      `;
      footerLeft = customSub || `cobertura ${d.coverage.toFixed(2)}x`;
    }

    return `
      <div class="fin-card-top">
        <span class="fin-cell-pill">${escapeHTML(evalEntry.cellRef)}</span>
        <span class="fin-verdict-pill ${badgeCls}">${d.verdictIcon} ${d.verdictLabel}</span>
      </div>
      <div class="fin-card-title text">${escapeHTML(n.text || def?.title || 'Gráfica Financiera')}</div>
      ${svgHtml}
      <div class="fin-card-foot">
        <span class="fin-card-fx">${escapeHTML(footerLeft)}</span>
        <span class="fin-card-refs">${escapeHTML(scopeLbl)}</span>
      </div>
    `;
  }

  // =========================================================================
  // RENDERIZADO HTML DE CADA NODO FINANCIERO EN EL LIENZO
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

    if (def?.isChart) {
      return renderFinanceChartCardHtml(n, def, evalEntry);
    }

    const catInfo = CATEGORY_MAP.get(def?.cat) || { cardTag: 'finanzas', label: 'finanzas' };
    const cleanTag = catInfo.cardTag || catInfo.label;
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
      : 'dato';

    return `
      <div class="fin-card-top">
        <span class="fin-cell-pill">${escapeHTML(evalEntry.cellRef)}</span>
        <span class="fin-cat-tag">${escapeHTML(cleanTag)}</span>
      </div>
      <div class="fin-card-title text">${escapeHTML(n.text || def?.title || 'Nodo financiero')}</div>
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
    if (def.isChart) {
      return type === 'fin_verdict_kpi'
        ? 'fin-node fin-chart-card fin-verdict-card fin-tone-chart'
        : 'fin-node fin-chart-card fin-tone-chart';
    }
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
    const verdictSpan = document.getElementById('finBarVerdict');
    const curSel = document.getElementById('finCurrencySel');

    if (curSel && curSel.value !== activeSheetCurrency) {
      curSel.value = activeSheetCurrency;
    }

    const s = lastComputedSheet.summary || {};
    if (verdictSpan) {
      if ((s.totalCells || 0) > 0) {
        const vCls = s.verdict === 'profit' ? 'is-profit' : s.verdict === 'loss' ? 'is-loss' : 'is-even';
        const vTxt =
          s.verdict === 'profit'
            ? `▲ GANANCIA +${compactMoney(s.netBalance)}`
            : s.verdict === 'loss'
              ? `▼ PÉRDIDA ${compactMoney(s.netBalance)}`
              : '● EQUILIBRIO';
        verdictSpan.className = `fin-bar-verdict ${vCls}`;
        verdictSpan.textContent = vTxt;
        verdictSpan.hidden = false;
      } else {
        verdictSpan.hidden = true;
      }
    }

    if (selNode && isFinanceNodeType(selNode.type)) {
      ensureFinanceNodeDefaults(selNode, STATE.nodes);
      const def = getFinanceNodeDef(selNode.type);
      const computed = lastComputedSheet.byNodeId.get(selNode.id);
      if (cellInput && document.activeElement !== cellInput) {
        cellInput.value = selNode.params.cellRef || 'A1';
        cellInput.disabled = false;
      }
      if (fxInput && document.activeElement !== fxInput) {
        if (def?.isChart) {
          fxInput.value = selNode.params.subtitle || '';
          fxInput.disabled = false;
          fxInput.placeholder = 'Subtítulo opcional de la gráfica financiera...';
        } else {
          fxInput.value = selNode.params.formula
            ? selNode.params.formula
            : String(selNode.params.value ?? 0);
          fxInput.disabled = false;
          fxInput.placeholder = 'Escribe un monto o fórmula (=A1-B1, =SUMA(A1:A3), =VNA(12%;B1:B4))';
        }
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
        fxInput.placeholder = 'Selecciona un nodo financiero para editar su monto o fórmula...';
      }
      if (resSpan) {
        const netFmt = formatFinanceNumber(s.netBalance || 0, 'currency', null);
        resSpan.textContent = `Neto: ${netFmt}`;
      }
    }
  }

  // =========================================================================
  // PALETA LATERAL DE NODOS Y GRÁFICAS FINANCIERAS + BUSCADOR
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

  function insertFinanceChartNodeOnCanvas(chartType) {
    const def = getFinanceNodeDef(chartType);
    if (!def || typeof createNode !== 'function') return null;

    const existing = Array.isArray(STATE.nodes) ? STATE.nodes : [];
    let x = 140;
    let y = 100;
    if (existing.length > 0) {
      const maxX = Math.max(...existing.map(it => (it.x || 0) + (it.w || 220)));
      const minY = Math.min(...existing.map(it => it.y || 60));
      const existingCharts = existing.filter(it => getFinanceNodeDef(it.type)?.isChart);
      x = Math.round((maxX + 96) / 12) * 12;
      y = Math.round((minY + existingCharts.length * 244) / 12) * 12;
    }

    const node = createNode(chartType, def.title, x, y);
    node.status = 'done';
    ensureFinanceNodeDefaults(node, existing);
    STATE.nodes.push(node);
    STATE.isBlankCanvas = false;
    setCanvasDomain('finance', true);
    if (typeof commitHistory === 'function') commitHistory();
    evaluateFinanceSheet();
    if (typeof setSel === 'function') setSel({ kind: 'node', id: node.id });
    if (typeof renderAll === 'function') renderAll();
    if (typeof fitView === 'function') requestAnimationFrame(() => fitView());
    if (typeof showToast === 'function') {
      showToast(`Gráfica añadida: ${def.title}`, 'ok', 1600);
    }
    return node;
  }

  // =========================================================================
  // MENÚ DE EDICIÓN AVANZADO PARA NODOS Y GRÁFICAS FINANCIERAS
  // =========================================================================
  function renderFinanceNodeInspector(container, n) {
    const def = getFinanceNodeDef(n.type);
    ensureFinanceNodeDefaults(n, STATE.nodes || []);
    evaluateFinanceSheet();
    const res = lastComputedSheet.byNodeId.get(n.id);
    const isChartNode = Boolean(def?.isChart);
    const catInfo = CATEGORY_MAP.get(def?.cat) || { cardTag: 'finanzas', label: 'finanzas' };

    const incomingEdges = (STATE.edges || []).filter(e => e.to === n.id);
    const outgoingEdges = (STATE.edges || []).filter(e => e.from === n.id);

    const needsRate =
      def?.rateParam !== undefined ||
      ['fin_rate', 'fin_npv', 'fin_pv', 'fin_fv', 'fin_pmt', 'fin_ipmt', 'fin_ppmt', 'fin_loan_balance', 'fin_compound_int', 'fin_tax', 'fin_vat_iva', 'fin_markup_price', 'fin_discount', 'fin_payroll_cost', 'fin_fx_rate', 'fin_chart_margin'].includes(n.type);

    const needsPeriods =
      !isChartNode &&
      (def?.nperParam !== undefined ||
        ['fin_periods', 'fin_pv', 'fin_fv', 'fin_cagr', 'fin_pmt', 'fin_ipmt', 'fin_ppmt', 'fin_loan_balance', 'fin_compound_int', 'fin_depreciation'].includes(n.type));

    const needsPeriodIdx = !isChartNode && ['fin_ipmt', 'fin_ppmt', 'fin_loan_balance'].includes(n.type);

    const valToneCls = res?.error
      ? 'is-loss'
      : def?.tone === 'negative' || (res && res.value < 0)
        ? 'is-loss'
        : 'is-profit';

    const typeOptionsHtml = FINANCE_CATEGORIES.map(cat => {
      const catItems = FINANCE_NODE_LIST.filter(it => it.cat === cat.id);
      return `<optgroup label="${escapeHTML(cat.label)}">${catItems
        .map(
          it =>
            `<option value="${escapeHTML(it.type)}" ${it.type === n.type ? 'selected' : ''}>${escapeHTML(it.title)}</option>`
        )
        .join('')}</optgroup>`;
    }).join('');

    const upstreamRefChips =
      res && res.upstreamRefs.length
        ? `<div class="insp-chip-row" style="margin-top:5px">
            ${res.upstreamRefs
              .map(
                ref =>
                  `<button type="button" class="insp-chip is-accent" data-insert-fx-ref="${escapeHTML(ref)}" title="Insertar ${escapeHTML(ref)} en la fórmula">[${escapeHTML(ref)}]</button>`
              )
              .join('')}
          </div>`
        : '';

    const connectionsHtml =
      incomingEdges.length || outgoingEdges.length
        ? `
        <div class="insp-section">
          <div class="insp-sec-head">
            <span>conexiones (${incomingEdges.length} ent · ${outgoingEdges.length} sal)</span>
          </div>
          <div class="insp-conn-list">
            ${incomingEdges
              .map(ed => {
                const src = byId(ed.from);
                const srcLbl = src
                  ? `${src.params?.cellRef ? `[${src.params.cellRef}] ` : ''}${src.text || src.type}`
                  : ed.from;
                return `
                  <div class="insp-conn-item">
                    <button type="button" class="insp-conn-jump" data-jump-node="${escapeHTML(ed.from)}" title="Ir al nodo origen">← ${escapeHTML(srcLbl)}</button>
                    <input type="text" class="insp-conn-lbl" data-edge-lbl="${escapeHTML(ed.id)}" placeholder="etiqueta" value="${escapeHTML(ed.label || '')}">
                    <button type="button" class="insp-conn-del" data-del-edge="${escapeHTML(ed.id)}" title="Desconectar">×</button>
                  </div>`;
              })
              .join('')}
            ${outgoingEdges
              .map(ed => {
                const dst = byId(ed.to);
                const dstLbl = dst
                  ? `${dst.params?.cellRef ? `[${dst.params.cellRef}] ` : ''}${dst.text || dst.type}`
                  : ed.to;
                return `
                  <div class="insp-conn-item">
                    <button type="button" class="insp-conn-jump" data-jump-node="${escapeHTML(ed.to)}" title="Ir al nodo destino">→ ${escapeHTML(dstLbl)}</button>
                    <input type="text" class="insp-conn-lbl" data-edge-lbl="${escapeHTML(ed.id)}" placeholder="etiqueta" value="${escapeHTML(ed.label || '')}">
                    <button type="button" class="insp-conn-del" data-del-edge="${escapeHTML(ed.id)}" title="Desconectar">×</button>
                  </div>`;
              })
              .join('')}
          </div>
        </div>`
        : '';

    container.innerHTML = `
      <div class="insp-shell">
        <div class="insp-header">
          <div class="insp-header__meta">
            <span class="insp-badge is-fin">${escapeHTML(n.params.cellRef)}</span>
            <span class="insp-type-tag">${escapeHTML(catInfo.cardTag || 'finanzas')}</span>
            ${n.locked ? '<span class="insp-type-tag is-warn">bloqueado</span>' : ''}
          </div>
          <div class="insp-quick-actions">
            <button type="button" class="insp-act-btn" id="finActCenter" title="Centrar en pantalla">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            </button>
            <button type="button" class="insp-act-btn" id="finActDup" title="Duplicar nodo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button type="button" class="insp-act-btn ${n.locked ? 'is-on' : ''}" id="finActLock" title="${n.locked ? 'Desbloquear posición' : 'Bloquear posición'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
            <button type="button" class="insp-act-btn is-danger" id="finActDel" title="Eliminar nodo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <div class="insp-fin-hero ${valToneCls}">
          <div>
            <span class="insp-fin-hero__lbl">${isChartNode ? 'indicador en vivo' : 'resultado calculado'}</span>
            <small class="insp-fin-hero__fx" id="finHeroFx">${escapeHTML(res?.fxText || def?.fxHint || '')}</small>
          </div>
          <strong class="insp-fin-hero__val" id="finHeroVal">${escapeHTML(res ? res.formatted : '0')}</strong>
        </div>

        <div class="insp-section">
          <div class="insp-sec-head"><span>identidad y función</span></div>
          <div class="insp-grid-2" style="grid-template-columns:76px 1fr">
            <div>
              <label>celda</label>
              <input type="text" id="finPropCellRef" maxlength="4" value="${escapeHTML(n.params.cellRef)}" style="text-transform:uppercase;font-weight:700;color:var(--green)">
            </div>
            <div>
              <label>concepto / título</label>
              <input type="text" id="finPropTitle" value="${escapeHTML(n.text || '')}" placeholder="Nombre del concepto...">
            </div>
          </div>
          <label>función / tipo de nodo financiero</label>
          <select id="finPropTypeSwitch">${typeOptionsHtml}</select>
        </div>

        ${
          isChartNode
            ? `
            <div class="insp-section">
              <div class="insp-sec-head"><span>origen de datos y visualización</span></div>
              <label>fuente del cálculo</label>
              <select id="finPropChartScope">
                <option value="auto" ${(n.params.dataScope || 'auto') === 'auto' ? 'selected' : ''}>Automático (conectados o planilla completa)</option>
                <option value="connected" ${n.params.dataScope === 'connected' ? 'selected' : ''}>Solo nodos conectados a esta gráfica</option>
                <option value="sheet" ${n.params.dataScope === 'sheet' ? 'selected' : ''}>Resumen global de toda la planilla</option>
              </select>
              <label>subtítulo personalizado (opcional)</label>
              <input type="text" id="finPropSubtitle" value="${escapeHTML(n.params.subtitle || '')}" placeholder="Ej: Escenario base Q4...">
              ${needsRate ? `<label>meta de margen objetivo (%)</label><input type="number" step="any" id="finPropRate" value="${Number(n.params.rate ?? def?.rateParam ?? 25)}">` : ''}
            </div>
          `
            : `
            <div class="insp-section">
              <div class="insp-sec-head">
                <span>valor y fórmula</span>
                <div class="insp-inline-tools">
                  <button type="button" class="insp-mini-btn" id="finBtnFlipSign" title="Invertir signo (+/-)">± signo</button>
                  <button type="button" class="insp-mini-btn" id="finBtnMul1k" title="Multiplicar valor base por 1,000">×1k</button>
                  <button type="button" class="insp-mini-btn" id="finBtnZero" title="Poner valor base en 0">0</button>
                </div>
              </div>
              <label>monto / valor base</label>
              <input type="number" step="any" id="finPropValue" value="${Number(n.params.value ?? 0)}">

              <label>fórmula personalizada (opcional)</label>
              <input type="text" id="finPropFormula" placeholder="Ej: =A1-B1, =SUMA(A1:A4), =VNA(12%;B1:B4)" value="${escapeHTML(n.params.formula || '')}">
              <div class="insp-chip-row">
                <button type="button" class="insp-chip" data-fx-tpl="=SUMA()">=SUMA()</button>
                <button type="button" class="insp-chip" data-fx-tpl="=PROMEDIO()">=PROMEDIO()</button>
                <button type="button" class="insp-chip" data-fx-tpl="=SI(A1>0;A1;0)">=SI()</button>
                <button type="button" class="insp-chip" data-fx-tpl="">limpiar fx</button>
              </div>
              ${upstreamRefChips}
            </div>

            <div class="insp-section">
              <div class="insp-sec-head"><span>formato y parámetros</span></div>
              <label>formato numérico</label>
              <select id="finPropFormat">
                <option value="currency" ${n.params.format === 'currency' ? 'selected' : ''}>Moneda (${getSheetCurrency().code})</option>
                <option value="percent" ${n.params.format === 'percent' ? 'selected' : ''}>Porcentaje (%)</option>
                <option value="number" ${n.params.format === 'number' ? 'selected' : ''}>Número decimal</option>
                <option value="multiple" ${n.params.format === 'multiple' ? 'selected' : ''}>Múltiplo / Ratio (x)</option>
                <option value="months" ${n.params.format === 'months' ? 'selected' : ''}>Periodos / Meses</option>
              </select>
              ${needsRate ? `<label>tasa / porcentaje / factor (%)</label><input type="number" step="any" id="finPropRate" value="${Number(n.params.rate ?? def?.rateParam ?? 12)}">` : ''}
              ${needsPeriods ? `<label>plazo / n° de periodos (nper)</label><input type="number" step="1" min="1" id="finPropNper" value="${Number(n.params.nper ?? def?.nperParam ?? 12)}">` : ''}
              ${needsPeriodIdx ? `<label>cuota / periodo a evaluar (k)</label><input type="number" step="1" min="1" id="finPropPeriodIdx" value="${Number(n.params.period ?? 1)}">` : ''}
            </div>
          `
        }

        <div class="insp-section">
          <div class="insp-sec-head"><span>notas / supuestos</span></div>
          <textarea id="finPropNotes" rows="2" placeholder="Documenta supuestos, fuente del dato o criterios...">${escapeHTML(n.params.notes || '')}</textarea>
        </div>

        ${connectionsHtml}
      </div>
    `;

    const refreshCalc = () => {
      evaluateFinanceSheet();
      renderNodes();
      drawEdges();
      if (typeof updateNodeQuickBar === 'function') updateNodeQuickBar();
      if (typeof drawMinimap === 'function') drawMinimap();
      if (typeof saveState === 'function') saveState();
      const updated = lastComputedSheet.byNodeId.get(n.id);
      const heroVal = document.getElementById('finHeroVal');
      const heroFx = document.getElementById('finHeroFx');
      if (heroVal && updated) heroVal.textContent = updated.formatted;
      if (heroFx && updated) heroFx.textContent = updated.fxText || '';
    };

    document.getElementById('finActCenter')?.addEventListener('click', () => {
      if (typeof centerOnNode === 'function') centerOnNode(n.id);
    });
    document.getElementById('finActDup')?.addEventListener('click', () => {
      if (typeof duplicateNodeById === 'function') duplicateNodeById(n.id);
    });
    document.getElementById('finActLock')?.addEventListener('click', () => {
      n.locked = !n.locked;
      commitHistory();
      refreshCalc();
      updatePanel();
    });
    document.getElementById('finActDel')?.addEventListener('click', () => {
      if (typeof deleteSelected === 'function') deleteSelected();
    });

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

    document.getElementById('finPropTypeSwitch')?.addEventListener('change', e => {
      const nextType = e.target.value;
      const nextDef = getFinanceNodeDef(nextType);
      if (!nextDef) return;
      const prevDef = getFinanceNodeDef(n.type);
      n.type = nextType;
      n.params.format = nextDef.format || n.params.format || 'currency';
      if (!n.text || (prevDef && n.text === prevDef.title)) {
        n.text = nextDef.title;
      }
      commitHistory();
      refreshCalc();
      updatePanel();
    });

    document.getElementById('finPropChartScope')?.addEventListener('change', e => {
      n.params.dataScope = e.target.value;
      commitHistory();
      refreshCalc();
      updatePanel();
    });

    document.getElementById('finPropSubtitle')?.addEventListener('input', e => {
      n.params.subtitle = e.target.value;
      refreshCalc();
    });

    document.getElementById('finPropValue')?.addEventListener('input', e => {
      n.params.value = parseFloat(e.target.value) || 0;
      refreshCalc();
    });

    document.getElementById('finBtnFlipSign')?.addEventListener('click', () => {
      n.params.value = -(Number(n.params.value) || 0);
      commitHistory();
      refreshCalc();
      updatePanel();
    });
    document.getElementById('finBtnMul1k')?.addEventListener('click', () => {
      const cur = Number(n.params.value) || 1;
      n.params.value = cur * 1000;
      commitHistory();
      refreshCalc();
      updatePanel();
    });
    document.getElementById('finBtnZero')?.addEventListener('click', () => {
      n.params.value = 0;
      commitHistory();
      refreshCalc();
      updatePanel();
    });

    const fxEl = document.getElementById('finPropFormula');
    fxEl?.addEventListener('change', e => {
      const raw = e.target.value.trim();
      n.params.formula = raw ? (raw.startsWith('=') ? raw : '=' + raw) : '';
      commitHistory();
      refreshCalc();
      updatePanel();
    });

    container.querySelectorAll('[data-fx-tpl]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = btn.dataset.fxTpl || '';
        n.params.formula = tpl;
        commitHistory();
        refreshCalc();
        updatePanel();
        const nextFx = document.getElementById('finPropFormula');
        if (nextFx && tpl) {
          nextFx.focus();
          const parenIdx = tpl.indexOf('()');
          if (parenIdx >= 0) nextFx.setSelectionRange(parenIdx + 1, parenIdx + 1);
        }
      });
    });

    container.querySelectorAll('[data-insert-fx-ref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.insertFxRef;
        const inp = document.getElementById('finPropFormula');
        if (!inp || !ref) return;
        let cur = inp.value.trim();
        if (!cur) cur = `=${ref}`;
        else if (cur.endsWith('()')) cur = cur.slice(0, -1) + ref + ')';
        else cur = `${cur}+${ref}`;
        n.params.formula = cur.startsWith('=') ? cur : '=' + cur;
        commitHistory();
        refreshCalc();
        updatePanel();
      });
    });

    document.getElementById('finPropRate')?.addEventListener('input', e => {
      n.params.rate = parseFloat(e.target.value) || 0;
      refreshCalc();
    });

    document.getElementById('finPropNper')?.addEventListener('input', e => {
      n.params.nper = Math.max(1, parseInt(e.target.value, 10) || 1);
      refreshCalc();
    });

    document.getElementById('finPropPeriodIdx')?.addEventListener('input', e => {
      n.params.period = Math.max(1, parseInt(e.target.value, 10) || 1);
      refreshCalc();
    });

    document.getElementById('finPropFormat')?.addEventListener('change', e => {
      n.params.format = e.target.value;
      commitHistory();
      refreshCalc();
      updatePanel();
    });

    document.getElementById('finPropNotes')?.addEventListener('input', e => {
      n.params.notes = e.target.value;
      if (typeof saveState === 'function') saveState();
    });

    container.querySelectorAll('[data-jump-node]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.jumpNode;
        if (typeof setSel === 'function') setSel({ kind: 'node', id: targetId });
        if (typeof centerOnNode === 'function') centerOnNode(targetId);
      });
    });

    container.querySelectorAll('[data-edge-lbl]').forEach(inp => {
      inp.addEventListener('change', e => {
        const ed = (STATE.edges || []).find(x => x.id === inp.dataset.edgeLbl);
        if (ed) {
          ed.label = e.target.value;
          commitHistory();
          drawEdges();
          saveState();
        }
      });
    });

    container.querySelectorAll('[data-del-edge]').forEach(btn => {
      btn.addEventListener('click', () => {
        const edId = btn.dataset.delEdge;
        STATE.edges = (STATE.edges || []).filter(x => x.id !== edId);
        commitHistory();
        refreshCalc();
        updatePanel();
      });
    });
  }

  function renderFinanceMetricsPanel(container) {
    const sheet = evaluateFinanceSheet();
    const s = sheet.summary;
    const entries = Array.from(sheet.byNodeId.values())
      .filter(e => !getFinanceNodeDef(e.type)?.isChart)
      .sort((a, b) => a.cellRef.localeCompare(b.cellRef, undefined, { numeric: true }));

    if (entries.length === 0) {
      container.innerHTML = `
        <h3>métricas y resultado financiero</h3>
        <div style="padding:12px;border-radius:7px;border:1px dashed var(--line);background:var(--bg2);font-size:9.6px;color:var(--tx2);line-height:1.45">
          Aún no hay nodos financieros en esta planilla.<br><br>
          Añade nodos o gráficas desde el panel izquierdo o carga una plantilla modelo para evaluar si hay <b>ganancia, pérdida o punto de equilibrio</b> en tiempo real.
        </div>
      `;
      return;
    }

    const inFmt = formatFinanceNumber(s.totalInflows, 'currency', null);
    const outFmt = formatFinanceNumber(s.totalOutflows, 'currency', null);
    const netSignedFmt =
      (s.netBalance > 0 ? '+' : '') + formatFinanceNumber(s.netBalance, 'currency', null);
    const mgFmt = s.impliedMarginPct !== null ? formatFinanceNumber(s.impliedMarginPct, 'percent', null) : '—';
    const covFmt = s.coverageRatio !== null ? `${s.coverageRatio.toFixed(2)}x` : '—';

    const vCls = s.verdict === 'profit' ? 'is-profit' : s.verdict === 'loss' ? 'is-loss' : 'is-even';
    const vTitle =
      s.verdict === 'profit'
        ? '▲ OPERACIÓN EN GANANCIA'
        : s.verdict === 'loss'
          ? '▼ OPERACIÓN EN PÉRDIDA'
          : '● PUNTO DE EQUILIBRIO';
    const vSub =
      s.verdict === 'profit'
        ? `Los ingresos superan a los egresos por ${formatFinanceNumber(s.netBalance, 'currency', null)}.`
        : s.verdict === 'loss'
          ? `Los costos/salidas exceden los ingresos por ${formatFinanceNumber(Math.abs(s.netBalance), 'currency', null)}.`
          : 'Los ingresos cubren exactamente los egresos actuales ($0 neto).';

    const maxBar = Math.max(1, s.totalInflows, s.totalOutflows, Math.abs(s.netBalance));
    const wIn = Math.max(4, Math.round((s.totalInflows / maxBar) * 150));
    const wOut = Math.max(4, Math.round((s.totalOutflows / maxBar) * 150));
    const wNet = Math.max(4, Math.round((Math.abs(s.netBalance) / maxBar) * 150));
    const netStroke = s.verdict === 'profit' ? '#4ade80' : s.verdict === 'loss' ? '#fb7185' : '#fbbf24';

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
      <h3>diagnóstico y métricas financieras</h3>
      <div class="fin-metrics-wrap">
        <div class="fin-diag-banner ${vCls}">
          <div class="fin-diag-banner__top">
            <span class="fin-verdict-pill ${vCls}">${vTitle}</span>
            <span class="fin-diag-cov">cobertura ${escapeHTML(covFmt)}</span>
          </div>
          <div class="fin-diag-banner__val">${escapeHTML(netSignedFmt)}</div>
          <div class="fin-diag-banner__desc">${escapeHTML(vSub)}</div>
        </div>

        <div class="fin-panel-chart-box">
          <div class="fin-panel-chart-head">
            <span>comparativa visual de resultado</span>
            <span>margen: <b>${escapeHTML(mgFmt)}</b></span>
          </div>
          <svg viewBox="0 0 260 92" class="fin-panel-svg" aria-hidden="true">
            <line x1="64" y1="6" x2="64" y2="84" stroke="#2a3138" stroke-width="1"/>
            <text x="2" y="23" fill="#94a3b8" font-size="8.4" font-family="JetBrains Mono">Ingresos</text>
            <rect x="65" y="13" width="${wIn}" height="13" rx="3" fill="#4ade80" fill-opacity="0.88"/>
            <text x="${Math.min(216, 70 + wIn)}" y="23" fill="#dcfce7" font-size="8.2" font-weight="700" font-family="JetBrains Mono">${escapeHTML(compactMoney(s.totalInflows))}</text>

            <text x="2" y="50" fill="#94a3b8" font-size="8.4" font-family="JetBrains Mono">Egresos</text>
            <rect x="65" y="40" width="${wOut}" height="13" rx="3" fill="#fb7185" fill-opacity="0.88"/>
            <text x="${Math.min(216, 70 + wOut)}" y="50" fill="#ffe4e6" font-size="8.2" font-weight="700" font-family="JetBrains Mono">${escapeHTML(compactMoney(s.totalOutflows))}</text>

            <text x="2" y="77" fill="#e2e8f0" font-size="8.4" font-weight="700" font-family="JetBrains Mono">${s.verdict === 'loss' ? 'Pérdida' : 'Ganancia'}</text>
            <rect x="65" y="67" width="${wNet}" height="13" rx="3" fill="${netStroke}"/>
            <text x="${Math.min(212, 70 + wNet)}" y="77" fill="${netStroke}" font-size="8.4" font-weight="700" font-family="JetBrains Mono">${escapeHTML((s.netBalance > 0 ? '+' : '') + compactMoney(s.netBalance))}</text>
          </svg>
        </div>

        <div class="fin-kpi-grid">
          <div class="fin-kpi-card">
            <span class="fin-kpi-lbl">ingresos / entradas</span>
            <span class="fin-kpi-num is-pos">${escapeHTML(inFmt)}</span>
          </div>
          <div class="fin-kpi-card">
            <span class="fin-kpi-lbl">costos / salidas</span>
            <span class="fin-kpi-num is-neg">${escapeHTML(outFmt)}</span>
          </div>
        </div>

        ${investHighlights}

        <div class="fin-insert-charts-box">
          <span class="fin-insert-charts-lbl">insertar gráfica de resultado en el lienzo</span>
          <div class="fin-insert-charts-grid">
            <button type="button" class="btn fin-ins-chart-btn" data-insert-fin-chart="fin_verdict_kpi">+ veredicto</button>
            <button type="button" class="btn fin-ins-chart-btn" data-insert-fin-chart="fin_chart_pnl">+ barras p&amp;l</button>
            <button type="button" class="btn fin-ins-chart-btn" data-insert-fin-chart="fin_chart_waterfall">+ cascada</button>
            <button type="button" class="btn fin-ins-chart-btn" data-insert-fin-chart="fin_chart_margin">+ margen %</button>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:var(--bg2);font-size:9px;color:var(--tx2)">
          <span>nodos: <b style="color:var(--tx0)">${s.totalCells}</b></span>
          <span>gráficas: <b style="color:var(--tx0)">${s.chartCells || 0}</b></span>
          <span>fórmulas: <b style="color:var(--tx0)">${s.formulaCells}</b></span>
          <span>errores: <b style="color:${s.errorCells ? '#fb7185' : '#4ade80'}">${s.errorCells}</b></span>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <span style="font-size:9.5px;font-weight:700;color:var(--tx1)">registro de valores en vivo</span>
            <button type="button" class="btn fin-csv-btn" id="btnPanelExportCsv">.csv</button>
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

    container.querySelectorAll('[data-insert-fin-chart]').forEach(btn => {
      btn.addEventListener('click', () => {
        insertFinanceChartNodeOnCanvas(btn.dataset.insertFinChart);
      });
    });

    container.querySelectorAll('[data-focus-fin-id]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.focusFinId;
        if (typeof setSel === 'function') setSel({ kind: 'node', id });
        if (typeof centerOnNode === 'function') centerOnNode(id);
      });
    });

    document.getElementById('btnPanelExportCsv')?.addEventListener('click', exportFinanceSheetCSV);
  }

  // =========================================================================
  // EXPORTACIÓN .CSV DE LA PLANILLA FINANCIERA
  // =========================================================================
  function exportFinanceSheetCSV() {
    const sheet = evaluateFinanceSheet();
    const entries = Array.from(sheet.byNodeId.values()).sort((a, b) =>
      a.cellRef.localeCompare(b.cellRef, undefined, { numeric: true })
    );
    if (!entries.length) {
      if (typeof showToast === 'function') showToast('No hay datos financieros para exportar', 'info', 1600);
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
    if (typeof showToast === 'function') showToast('Planilla exportada a .CSV', 'ok', 1800);
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

    if (templateKey === 'fin_dashboard_pnl') {
      const rev = mk('fin_revenue', 'Ingresos por Ventas', 'A1', 128000, 84, 60);
      const otherIn = mk('fin_cash_in', 'Ingresos Servicios', 'A2', 24000, 84, 240);
      const cogs = mk('fin_cogs', 'Costo Directo (COGS)', 'B1', 54000, 360, 60);
      const opex = mk('fin_opex', 'Gastos Operativos', 'B2', 31500, 360, 240);
      const ebitda = mk('fin_ebitda', 'EBITDA Operativo', 'C1', 0, 636, 60, { formula: '=A1+A2-B1-B2' });
      const tax = mk('fin_tax', 'Impuestos (10%)', 'C2', 0, 636, 240, { rate: 10 });
      const net = mk('fin_net_income', 'Utilidad Neta Final', 'D1', 0, 912, 150);
      const verdict = mk('fin_verdict_kpi', 'Veredicto del Ejercicio', 'E1', 0, 84, 456);
      const chartPnl = mk('fin_chart_pnl', 'Ingresos vs Costos', 'E2', 0, 384, 456);
      const chartWf = mk('fin_chart_waterfall', 'Cascada de Rentabilidad', 'E3', 0, 720, 456);

      wire(rev, ebitda, '+'); wire(otherIn, ebitda, '+');
      wire(cogs, ebitda, '-'); wire(opex, ebitda, '-');
      wire(ebitda, tax, 'Base');
      wire(ebitda, net); wire(tax, net, '-Imp');
      wire(rev, chartPnl); wire(otherIn, chartPnl); wire(cogs, chartPnl); wire(opex, chartPnl); wire(tax, chartPnl); wire(net, chartPnl);
      wire(rev, chartWf); wire(otherIn, chartWf); wire(cogs, chartWf); wire(opex, chartWf); wire(tax, chartWf);
      wire(net, verdict);
      return { nodes: N, edges: E, domain: 'finance', title: 'tablero_ganancia_perdida' };
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
        const def = getFinanceNodeDef(selNode.type);
        const raw = fxInput.value.trim();
        if (def?.isChart) {
          selNode.params.subtitle = raw;
        } else if (raw.startsWith('=')) {
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

    const verdictEl = document.getElementById('finBarVerdict');
    if (verdictEl) {
      verdictEl.style.cursor = 'pointer';
      verdictEl.addEventListener('click', () => {
        if (typeof setTab === 'function') setTab('stats');
      });
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
  window.insertFinanceChartNodeOnCanvas = insertFinanceChartNodeOnCanvas;
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
