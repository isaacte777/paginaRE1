// Sistema Financiero Familiar Gere y Milki
// Datos completos extraídos del Excel

export interface MonthlyData {
  month: string;
  year: number;
  initialBalance: number;
  finalBalance: number;
  percentageChange: number;
  savingsChange: number;
  budgetedExpenses: number;
  actualExpenses: number;
  budgetedIncome: number;
  actualIncome: number;
  expenses: Expense[];
  incomes: Income[];
}

export interface Expense {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
  subcategory?: string;
}

export interface Income {
  source: string;
  projected: number;
  actual: number;
  difference: number;
  paid?: number;
}

export interface Debt {
  name: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  installments: Installment[];
  status: 'active' | 'cancelled';
}

export interface Installment {
  number: number;
  amount: number;
  paid: number;
  date?: string;
}

export interface CreditCard {
  bank: string;
  owner: string;
  totalLimit: number;
  consumed: number;
  remaining: number;
}

export interface PaymentSchedule {
  name: string;
  period: string;
  payments: Payment[];
  pendingAmount: number;
}

export interface Payment {
  month: string;
  day13?: number;
  day30?: number;
  day05?: number;
  total: number;
  status: string;
  concept: string;
}

// DATOS DE OCTUBRE 2026
export const october2026: MonthlyData = {
  month: 'Octubre',
  year: 2026,
  initialBalance: 3863526,
  finalBalance: 1237016,
  percentageChange: -68,
  savingsChange: -2626510,
  budgetedExpenses: 7816000,
  actualExpenses: 5076510,
  budgetedIncome: 8500000,
  actualIncome: 2450000,
  expenses: [
    { category: 'VIVIENDA', budgeted: 0, actual: 0, difference: 0 },
    { category: 'SUPERMERCADO', budgeted: 850000, actual: 28210, difference: 821790 },
    { category: 'DIEZMO', budgeted: 245000, actual: 0, difference: 245000 },
    { category: 'COMIDAS FUERA', budgeted: 300000, actual: 28500, difference: 271500 },
    { category: 'CONTADORA', budgeted: 100000, actual: 0, difference: 100000 },
    { category: 'COMBUSTIBLE', budgeted: 150000, actual: 22000, difference: 128000 },
    { category: 'COMPRAS IMPULSIVAS', budgeted: 100000, actual: 0, difference: 100000 },
    { category: 'LUZ Y AGUA', budgeted: 100000, actual: 78000, difference: 22000 },
    { category: 'COSAS PARA EL HOGAR', budgeted: 50000, actual: 0, difference: 50000 },
    { category: 'CAPCUP', budgeted: 50000, actual: 0, difference: 50000 },
    { category: 'CANVA', budgeted: 20000, actual: 0, difference: 20000 },
    { category: 'GOOGLE ONE', budgeted: 16000, actual: 0, difference: 16000 },
    { category: 'BASURERO', budgeted: 5000, actual: 0, difference: 5000 },
    { category: 'AGUA MINERAL', budgeted: 11000, actual: 0, difference: 11000 },
    { category: 'WIFI', budgeted: 130000, actual: 0, difference: 130000 },
    { category: 'LAYROOM', budgeted: 8000, actual: 0, difference: 8000 },
    { category: 'ICLOUD', budgeted: 122000, actual: 122000, difference: 0 },
    { category: 'UENO MILKI', budgeted: 342000, actual: 0, difference: 342000 },
    { category: 'UENO GERE', budgeted: 270000, actual: 0, difference: 270000 },
    { category: 'TIO RODY', budgeted: 4600000, actual: 4600000, difference: 0 },
    { category: 'TABLET', budgeted: 347000, actual: 0, difference: 347000 },
    { category: 'MILKI', budgeted: 0, actual: 150000, difference: -150000 },
    { category: 'BIGGIE', budgeted: 0, actual: 6000, difference: -6000 },
    { category: 'SALDO Y PACK', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'VELLEZA', budgeted: 0, actual: 21800, difference: -21800 },
    { category: 'MAS', budgeted: 0, actual: 10000, difference: -10000 },
  ],
  incomes: [
    { source: 'TODO OFICINA', projected: 700000, actual: 700000, difference: 0 },
    { source: 'SUPER AVENIDA', projected: 450000, actual: 450000, difference: 0 },
    { source: 'BELLOSA', projected: 600000, actual: 600000, difference: 0 },
    { source: 'RELEVAMIENTO GUIDO', projected: 1500000, actual: 1500000, difference: 0 },
    { source: 'SERGEI', projected: 500000, actual: 500000, difference: 0 },
    { source: 'RELEVAMIENTO GUIDO', projected: 600000, actual: 600000, difference: 0 },
    { source: 'PROYECTO ESMERALDA', projected: 1000000, actual: 0, difference: -1000000 },
    { source: 'REFORMA PINOZA', projected: 4250000, actual: 0, difference: -4250000 },
    { source: 'RELEVAMIENTO ED. INTER', projected: 1000000, actual: 0, difference: -1000000 },
    { source: 'MELI', projected: 0, actual: 50000, difference: 50000 },
    { source: 'JOSE CHAMORRO', projected: 0, actual: 150000, difference: 150000 },
  ]
};

// DATOS DE SEPTIEMBRE 2026
export const september2026: MonthlyData = {
  month: 'Septiembre',
  year: 2026,
  initialBalance: 570692,
  finalBalance: 3717847,
  percentageChange: 551,
  savingsChange: 3147155,
  budgetedExpenses: 9744150,
  actualExpenses: 6054345,
  budgetedIncome: 14700000,
  actualIncome: 9201500,
  expenses: [
    { category: 'VIVIENDA', budgeted: 0, actual: 0, difference: 0 },
    { category: 'SUPERMERCADO', budgeted: 850000, actual: 1203450, difference: -353450 },
    { category: 'DIEZMO', budgeted: 920150, actual: 105000, difference: 815150 },
    { category: 'COMIDAS FUERA', budgeted: 300000, actual: 614962, difference: -314962 },
    { category: 'CONTADORA', budgeted: 100000, actual: 100000, difference: 0 },
    { category: 'COMBUSTIBLE', budgeted: 150000, actual: 239041, difference: -89041 },
    { category: 'COMPRAS IMPULSIVAS', budgeted: 100000, actual: 0, difference: 100000 },
    { category: 'LUZ Y AGUA', budgeted: 100000, actual: 0, difference: 100000 },
    { category: 'COSAS PARA EL HOGAR', budgeted: 50000, actual: 0, difference: 50000 },
    { category: 'CAPCUP', budgeted: 50000, actual: 0, difference: 50000 },
    { category: 'CANVA', budgeted: 20000, actual: 20000, difference: 0 },
    { category: 'GOOGLE ONE', budgeted: 16000, actual: 0, difference: 16000 },
    { category: 'BASURERO', budgeted: 5000, actual: 7000, difference: -2000 },
    { category: 'AGUA MINERAL', budgeted: 11000, actual: 35000, difference: -24000 },
    { category: 'WIFI', budgeted: 130000, actual: 130000, difference: 0 },
    { category: 'LAYROOM', budgeted: 6000, actual: 6000, difference: 0 },
    { category: 'UENO MILKI', budgeted: 342000, actual: 0, difference: 342000 },
    { category: 'UENO GERE', budgeted: 270000, actual: 540552, difference: -270552 },
    { category: 'TIO RODY', budgeted: 5300000, actual: 700000, difference: 4600000 },
    { category: 'MOTO', budgeted: 277000, actual: 277000, difference: 0 },
    { category: 'TABLET', budgeted: 347000, actual: 358104, difference: -11104 },
    { category: 'MILKI', budgeted: 400000, actual: 367000, difference: -33000 },
    { category: 'GERE RETIRO EFECTIVO', budgeted: 0, actual: 400000, difference: -400000 },
    { category: 'FARMACIA', budgeted: 0, actual: 164124, difference: -164124 },
    { category: 'BIGGIE', budgeted: 0, actual: 144225, difference: -144225 },
    { category: 'SALDO', budgeted: 0, actual: 105000, difference: -105000 },
    { category: 'ESTACIÓN DE SERVICIO', budgeted: 0, actual: 80000, difference: -80000 },
    { category: 'BOLT', budgeted: 0, actual: 29000, difference: -29000 },
    { category: 'VESTIDO', budgeted: 0, actual: 30000, difference: -30000 },
    { category: 'VELLEZA', budgeted: 0, actual: 106500, difference: -106500 },
    { category: 'MAS', budgeted: 0, actual: 21800, difference: -21800 },
    { category: 'PEAJE', budgeted: 0, actual: 30000, difference: -30000 },
    { category: 'SEX', budgeted: 0, actual: 9800, difference: -9800 },
    { category: 'PASAJE CENTRAL', budgeted: 0, actual: 52000, difference: -52000 },
    { category: 'REENVOLSO CURSO', budgeted: 0, actual: 72000, difference: -72000 },
    { category: 'DESPENSA', budgeted: 0, actual: 56000, difference: -56000 },
    { category: 'META', budgeted: 0, actual: 50787, difference: -50787 },
  ],
  incomes: [
    { source: 'TODO OFICINA', projected: 1200000, actual: 600000, difference: -600000, paid: 600000 },
    { source: 'SUPER AVENIDA', projected: 250000, actual: 250000, difference: 0 },
    { source: 'BELLOSA', projected: 600000, actual: 0, difference: -600000 },
    { source: 'CESAR TULLO', projected: 500000, actual: 500000, difference: 0 },
    { source: 'ASSAN', projected: 750000, actual: 750000, difference: 0 },
    { source: 'CLEO ESTETICA', projected: 150000, actual: 150000, difference: 0 },
    { source: 'PROYECTO ESMERALDA', projected: 1000000, actual: 0, difference: -1000000 },
    { source: 'RELEVAMIENTO GUIDO', projected: 1500000, actual: 1500000, difference: 0 },
    { source: 'SERGEI', projected: 500000, actual: 0, difference: -500000 },
    { source: 'REFORMA', projected: 4250000, actual: 0, difference: -4250000 },
    { source: 'RELEVAMIENTO GUIDO', projected: 600000, actual: 600000, difference: 0 },
    { source: 'RELEVAMIENTO ED. INTER', projected: 2000000, actual: 1000000, difference: -1000000 },
    { source: 'FRED COLMAN', projected: 0, actual: 250000, difference: 250000 },
    { source: 'PAGO GUADA', projected: 0, actual: 550000, difference: 550000 },
    { source: 'EXHIBICION', projected: 0, actual: 250000, difference: 250000 },
    { source: 'PAGO PRESUPUESTO', projected: 0, actual: 150000, difference: 150000 },
    { source: 'PAGO REIMAX', projected: 0, actual: 130000, difference: 130000 },
    { source: 'PAGO MAQUILLAJE', projected: 0, actual: 200000, difference: 200000 },
    { source: 'REENVOLSO MILKI', projected: 0, actual: 11500, difference: 11500 },
    { source: 'CHIPA BARRERO', projected: 0, actual: 300000, difference: 300000 },
    { source: 'JOSE CHAMORRO', projected: 250000, actual: 100000, difference: -150000 },
    { source: 'PAGO GUADA', projected: 550000, actual: 590000, difference: 40000 },
    { source: 'CECI', projected: 0, actual: 50000, difference: 50000 },
    { source: 'ASTRA', projected: 0, actual: 80000, difference: 80000 },
    { source: 'PAGO GUADA', projected: 600000, actual: 540000, difference: -60000 },
    { source: 'DRA. STEFI', projected: 0, actual: 350000, difference: 350000 },
  ]
};

// DATOS DE AGOSTO 2026
export const august2026: MonthlyData = {
  month: 'Agosto',
  year: 2026,
  initialBalance: 1137274,
  finalBalance: 570692,
  percentageChange: -50,
  savingsChange: -566582,
  budgetedExpenses: 6213000,
  actualExpenses: 11448382,
  budgetedIncome: 16700000,
  actualIncome: 10881800,
  expenses: [
    { category: 'VIVIENDA', budgeted: 1000000, actual: 2000000, difference: -1000000 },
    { category: 'SUPERMERCADO', budgeted: 850000, actual: 782156, difference: 67844 },
    { category: 'DIEZMO', budgeted: 0, actual: 122000, difference: -122000 },
    { category: 'COMIDAS FUERA', budgeted: 200000, actual: 792400, difference: -592400 },
    { category: 'TARJETA MAS', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'OCIO Y ANTOJOS', budgeted: 150000, actual: 48500, difference: 101500 },
    { category: 'CONTADORA', budgeted: 100000, actual: 0, difference: 100000 },
    { category: 'COMBUSTIBLE', budgeted: 150000, actual: 426000, difference: -276000 },
    { category: 'COMPRAS IMPULSIVAS', budgeted: 100000, actual: 150000, difference: -50000 },
    { category: 'LUZ Y AGUA', budgeted: 83000, actual: 262000, difference: -179000 },
    { category: 'COSAS PARA EL HOGAR', budgeted: 50000, actual: 196750, difference: -146750 },
    { category: 'SALUD', budgeted: 0, actual: 223214, difference: -223214 },
    { category: 'VELLEZA', budgeted: 0, actual: 43100, difference: -43100 },
    { category: 'CAPCUP', budgeted: 50000, actual: 50000, difference: 0 },
    { category: 'CANVA', budgeted: 10000, actual: 10000, difference: 0 },
    { category: 'GOOGLE ONE', budgeted: 16000, actual: 20000, difference: -4000 },
    { category: 'UENO MILKI', budgeted: 342000, actual: 342000, difference: 0 },
    { category: 'UENO GERE', budgeted: 270000, actual: 541162, difference: -271162 },
    { category: 'TIO RODY', budgeted: 300000, actual: 300000, difference: 0 },
    { category: 'MOTO', budgeted: 245000, actual: 266100, difference: -21100 },
    { category: 'TABLET', budgeted: 347000, actual: 347000, difference: 0 },
    { category: 'MILKI', budgeted: 150000, actual: 480000, difference: 330000 },
    { category: 'GERE RETIRO EFECTIVO', budgeted: 0, actual: 100000, difference: -100000 },
    { category: 'TRAJE DE BODA SEÑA', budgeted: 250000, actual: 250000, difference: 0 },
    { category: 'ANILLO', budgeted: 250000, actual: 250000, difference: 0 },
    { category: 'VESTIDO DE NOVIA', budgeted: 250000, actual: 250000, difference: 0 },
    { category: 'CAMISA', budgeted: 0, actual: 76950, difference: -76950 },
    { category: 'ZAPATOS', budgeted: 0, actual: 100000, difference: -100000 },
    { category: 'MAQUILLAJE', budgeted: 0, actual: 150000, difference: -150000 },
    { category: 'IMPRESION MYG', budgeted: 0, actual: 20000, difference: -20000 },
    { category: 'LENCERIA', budgeted: 0, actual: 38500, difference: -38500 },
    { category: 'CIVIL', budgeted: 500000, actual: 500000, difference: 0 },
    { category: 'LUZCECITAS', budgeted: 0, actual: 87000, difference: -87000 },
    { category: 'PELUQUERIA', budgeted: 0, actual: 60000, difference: -60000 },
    { category: 'SEPARACION DE BIENES', budgeted: 500000, actual: 250000, difference: 250000 },
    { category: 'EQUIPO DE SONIDO', budgeted: 0, actual: 400000, difference: -400000 },
    { category: 'CHIPITA', budgeted: 50000, actual: 50000, difference: 0 },
    { category: 'FARMACIA', budgeted: 0, actual: 51983, difference: -51983 },
    { category: 'BIGGIE', budgeted: 0, actual: 351669, difference: -351669 },
    { category: 'ZAPATILLAS', budgeted: 0, actual: 33800, difference: -33800 },
    { category: 'SALDO', budgeted: 0, actual: 187000, difference: -187000 },
    { category: 'CANVA', budgeted: 0, actual: 40000, difference: -40000 },
    { category: 'ESTACIÓN DE SERVICIO', budgeted: 0, actual: 77500, difference: -77500 },
    { category: 'HELADO AMANDAU', budgeted: 0, actual: 22000, difference: -22000 },
    { category: 'COMIDA VIAJE', budgeted: 0, actual: 50500, difference: -50500 },
    { category: 'PIZZA VIAJE', budgeted: 0, actual: 55000, difference: -55000 },
    { category: 'CECI', budgeted: 0, actual: 105000, difference: -105000 },
    { category: 'RELOJ', budgeted: 0, actual: 40000, difference: -40000 },
    { category: 'REGALO', budgeted: 0, actual: 17300, difference: -17300 },
    { category: 'COMEDOR FADA', budgeted: 0, actual: 23000, difference: -23000 },
    { category: 'BOLT', budgeted: 0, actual: 40300, difference: -40300 },
    { category: 'FLETE', budgeted: 0, actual: 100000, difference: -100000 },
    { category: 'BEBIDAS BODA', budgeted: 0, actual: 69450, difference: -69450 },
    { category: 'LUNA DE MIEL', budgeted: 0, actual: 29000, difference: -29000 },
    { category: 'FUGAS', budgeted: 0, actual: 155048, difference: -155048 },
  ],
  incomes: [
    { source: 'ASTRA AI', projected: 1000000, actual: 1000000, difference: 0, paid: 0 },
    { source: 'ASTRA AI (comision)', projected: 0, actual: 361800, difference: 361800, paid: 0 },
    { source: 'Todo oficina', projected: 1200000, actual: 600000, difference: -600000, paid: 600000 },
    { source: 'Super Avenida', projected: 450000, actual: 0, difference: -450000, paid: 450000 },
    { source: 'Bellosa', projected: 600000, actual: 0, difference: -600000, paid: 0 },
    { source: 'Cesar Tullo', projected: 1000000, actual: 500000, difference: -500000, paid: 0 },
    { source: 'Floreria Iris', projected: 600000, actual: 615000, difference: 15000, paid: 0 },
    { source: 'ASSAN', projected: 750000, actual: 750000, difference: 0, paid: 0 },
    { source: 'PROYECTO ESMERALDA', projected: 1000000, actual: 0, difference: -1000000 },
    { source: 'RELEVAMIENTO GUIDO', projected: 3000000, actual: 1500000, difference: -1500000 },
    { source: 'SERGEI', projected: 1000000, actual: 500000, difference: -500000 },
    { source: 'REFORMA', projected: 5500000, actual: 1250000, difference: -4250000 },
    { source: 'RELEVAMIENTO GUIDO', projected: 600000, actual: 0, difference: -600000 },
    { source: 'JIMMY', projected: 0, actual: 200000, difference: 200000 },
    { source: 'FANCISCO', projected: 0, actual: 150000, difference: 150000 },
    { source: 'PRIMO IVAN', projected: 0, actual: 150000, difference: 150000 },
    { source: 'YANIS', projected: 0, actual: 300000, difference: 300000 },
    { source: 'TIA SONIA', projected: 0, actual: 100000, difference: 100000 },
    { source: 'VANIA CARVALIO', projected: 0, actual: 550000, difference: 550000 },
    { source: 'MARTA Y ROQUE', projected: 0, actual: 100000, difference: 100000 },
    { source: 'TIM', projected: 0, actual: 240000, difference: 240000 },
    { source: 'CELULA', projected: 0, actual: 500000, difference: 500000 },
    { source: 'PRESUPUESTO', projected: 0, actual: 170000, difference: 170000 },
    { source: 'FOTOGRAFIA', projected: 0, actual: 450000, difference: 450000 },
    { source: 'ARTURO', projected: 0, actual: 25000, difference: 25000 },
    { source: 'MI AROMA', projected: 0, actual: 150000, difference: 150000 },
    { source: 'REENVOLSO CECI', projected: 0, actual: 50000, difference: 50000 },
    { source: 'REEMBOLSO TRAJE', projected: 0, actual: 110000, difference: 110000 },
    { source: 'REENVOLSO PASAJE KIARA', projected: 0, actual: 35000, difference: 35000 },
    { source: 'SESION SANBER', projected: 0, actual: 500000, difference: 500000 },
    { source: 'REEMBOLSO KAMI', projected: 0, actual: 25000, difference: 25000 },
  ]
};

// DATOS DE JULIO 2026
export const july2026: MonthlyData = {
  month: 'Julio',
  year: 2026,
  initialBalance: 510846,
  finalBalance: 1041132,
  percentageChange: 104,
  savingsChange: 530286,
  budgetedExpenses: 7451000,
  actualExpenses: 8232714,
  budgetedIncome: 13180000,
  actualIncome: 8763000,
  expenses: [
    { category: 'VIVIENDA', budgeted: 1000000, actual: 0, difference: 1000000 },
    { category: 'SUPERMERCADO', budgeted: 850000, actual: 830445, difference: 19555 },
    { category: 'TABLET', budgeted: 347000, actual: 365000, difference: -18000 },
    { category: 'DIEZMO', budgeted: 350000, actual: 70000, difference: 280000 },
    { category: 'COOPERATIVA CUMBRE', budgeted: 314000, actual: 0, difference: 314000 },
    { category: 'COMIDAS FUERA', budgeted: 300000, actual: 186500, difference: 113500 },
    { category: 'UENO', budgeted: 270000, actual: 0, difference: 270000 },
    { category: 'LAVARROPAS', budgeted: 260000, actual: 260000, difference: 0 },
    { category: 'TARJETA MAS', budgeted: 0, actual: 20000, difference: -20000 },
    { category: 'MOTO', budgeted: 245000, actual: 245000, difference: 0 },
    { category: 'OCIO Y ANTOJOS', budgeted: 150000, actual: 385000, difference: -235000 },
    { category: 'VIATICO DE M', budgeted: 150000, actual: 140000, difference: 10000 },
    { category: 'CONTADORA', budgeted: 100000, actual: 0, difference: 100000 },
    { category: 'COMBUSTIBLE EXTRA', budgeted: 100000, actual: 220000, difference: -120000 },
    { category: 'COMPRAS IMPULSIVAS', budgeted: 100000, actual: 166450, difference: -66450 },
    { category: 'LUZ Y AGUA', budgeted: 83000, actual: 0, difference: 83000 },
    { category: 'PLAN PERSONAL', budgeted: 60000, actual: 60000, difference: 0 },
    { category: 'DIEZMO', budgeted: 500000, actual: 0, difference: 500000 },
    { category: 'MILKI', budgeted: 0, actual: 200000, difference: -200000 },
    { category: 'TRAJE DE BODA SEÑA', budgeted: 300000, actual: 50000, difference: 250000 },
    { category: 'FOTOGRAFO LIQUIDACION', budgeted: 250000, actual: 250000, difference: 0 },
    { category: 'BOCADITOS SEÑA', budgeted: 750000, actual: 750000, difference: 0 },
    { category: 'GASTOS BARIOS', budgeted: 0, actual: 678500, difference: -678500 },
    { category: 'PACK', budgeted: 0, actual: 7000, difference: -7000 },
    { category: 'MILCA GASTOS SUPER', budgeted: 0, actual: 150000, difference: -150000 },
    { category: 'PELUQUERIA BARBA', budgeted: 0, actual: 25000, difference: -25000 },
    { category: 'GLOBOS', budgeted: 0, actual: 17100, difference: -17100 },
    { category: 'REMEDIOS PARA MILKI', budgeted: 0, actual: 35216, difference: -35216 },
    { category: 'POWER', budgeted: 0, actual: 19750, difference: -19750 },
    { category: 'MERIENDA', budgeted: 0, actual: 32000, difference: -32000 },
    { category: 'SALDO', budgeted: 0, actual: 30000, difference: -30000 },
    { category: 'FOTOGRAFO LIQUIDACION', budgeted: 0, actual: 250000, difference: -250000 },
    { category: 'COBERTURA LIQUIDACION', budgeted: 0, actual: 500000, difference: -500000 },
    { category: 'LAIROOM', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'YENI', budgeted: 0, actual: 18450, difference: -18450 },
    { category: 'COCA', budgeted: 0, actual: 8000, difference: -8000 },
    { category: 'EXTRACCION EFECTIVO', budgeted: 0, actual: 50000, difference: -50000 },
    { category: 'FERRETERIA', budgeted: 0, actual: 41500, difference: -41500 },
    { category: 'PRUEBA', budgeted: 0, actual: 26993, difference: -26993 },
    { category: 'EMERGENCIA', budgeted: 0, actual: 50008, difference: -50008 },
    { category: 'BIGGIE', budgeted: 0, actual: 119180, difference: -119180 },
    { category: 'ROPA VESTIDO DESPEDIDA', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'ARTURO', budgeted: 0, actual: 100000, difference: -100000 },
    { category: 'regalo día del amigo', budgeted: 30000, actual: 50000, difference: -20000 },
    { category: 'entrada al escondido', budgeted: 0, actual: 35000, difference: -35000 },
    { category: 'cuchillos', budgeted: 0, actual: 22700, difference: -22700 },
    { category: 'ACEITE MOTOR', budgeted: 0, actual: 20000, difference: -20000 },
    { category: 'REGALO DIA DEL AMIGO', budgeted: 0, actual: 23900, difference: -23900 },
    { category: 'CINTA METRICA', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'MAS TARJETA', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'BOLT', budgeted: 0, actual: 18000, difference: -18000 },
    { category: 'VESTIDO', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'CAPCUP', budgeted: 0, actual: 25000, difference: -25000 },
    { category: 'REPUESTO MOTO', budgeted: 0, actual: 40000, difference: -40000 },
    { category: 'UÑAS', budgeted: 0, actual: 50000, difference: -50000 },
    { category: 'PERFUME', budgeted: 0, actual: 25000, difference: -25000 },
    { category: 'FUGAS', budgeted: 0, actual: 286572, difference: -286572 },
  ],
  incomes: [
    { source: 'ASTRA AI', projected: 1000000, actual: 0, difference: -1000000 },
    { source: 'ASTRA AI (comision)', projected: 150000, actual: 0, difference: -150000 },
    { source: 'Todo oficina', projected: 1200000, actual: 1000000, difference: -200000 },
    { source: 'Super Avenida', projected: 450000, actual: 900000, difference: 450000 },
    { source: 'Bodega', projected: 280000, actual: 280000, difference: 0 },
    { source: 'Bellosa', projected: 600000, actual: 600000, difference: 0 },
    { source: 'Cesar Tullo', projected: 850000, actual: 0, difference: -850000 },
    { source: 'Floreria Iris', projected: 600000, actual: 300000, difference: -300000 },
    { source: 'ASSAN', projected: 750000, actual: 750000, difference: 0 },
    { source: 'PROYECTO ZARATE 3', projected: 1000000, actual: 1000000, difference: 0 },
    { source: 'PROYECTO ESMERALDA', projected: 1000000, actual: 0, difference: -1000000 },
    { source: 'RELEVAMIENTO GUIDO', projected: 3000000, actual: 0, difference: -3000000 },
    { source: 'CESAR TULLO', projected: 300000, actual: 0, difference: -300000 },
    { source: 'TRABAJO A INGENIERO', projected: 2000000, actual: 0, difference: -2000000 },
    { source: 'PASTORA', projected: 0, actual: 500000, difference: 500000 },
    { source: 'MIA MULLER', projected: 0, actual: 450000, difference: 450000 },
    { source: 'SANBER', projected: 0, actual: 378000, difference: 378000 },
    { source: 'VIDEO DE LA GUERRA', projected: 0, actual: 325000, difference: 325000 },
    { source: 'REGALO ABUE', projected: 0, actual: 700000, difference: 700000 },
    { source: 'ARTURO', projected: 0, actual: 10000, difference: 10000 },
    { source: 'REGALO TRAJE', projected: 0, actual: 200000, difference: 200000 },
    { source: 'REIMAX', projected: 0, actual: 250000, difference: 250000 },
    { source: 'PAGO VIATICO', projected: 0, actual: 50000, difference: 50000 },
    { source: 'MI AROMA', projected: 0, actual: 100000, difference: 100000 },
    { source: 'ALANA', projected: 0, actual: 150000, difference: 150000 },
    { source: 'pago viatico', projected: 0, actual: 250000, difference: 250000 },
    { source: 'escondido', projected: 0, actual: 170000, difference: 170000 },
    { source: 'CHIPA BARRERO', projected: 0, actual: 300000, difference: 300000 },
    { source: 'MILKI', projected: 0, actual: 100000, difference: 100000 },
  ]
};

// DATOS DE JUNIO 2026
export const june2026: MonthlyData = {
  month: 'Junio',
  year: 2026,
  initialBalance: 0,
  finalBalance: 470708,
  percentageChange: 0,
  savingsChange: 470708,
  budgetedExpenses: 5754362,
  actualExpenses: 11376292,
  budgetedIncome: 8866000,
  actualIncome: 11847000,
  expenses: [
    { category: 'SUPERMERCADO', budgeted: 300000, actual: 1104591, difference: -804591 },
    { category: 'PLAN TIGO', budgeted: 120000, actual: 120000, difference: 0 },
    { category: 'UENO', budgeted: 530000, actual: 530000, difference: 0 },
    { category: 'VIVIENDA', budgeted: 1000000, actual: 1000000, difference: 0 },
    { category: 'MOTO', budgeted: 245000, actual: 245000, difference: 0 },
    { category: 'COMPU', budgeted: 300000, actual: 300000, difference: 0 },
    { category: 'LAVARROPAS', budgeted: 260000, actual: 260000, difference: 0 },
    { category: 'LUZ Y AGUA', budgeted: 83000, actual: 162000, difference: -79000 },
    { category: 'VIATICO DE M', budgeted: 150000, actual: 266368, difference: -116368 },
    { category: 'COOPERATIVA CUMBRE', budgeted: 314000, actual: 314000, difference: 0 },
    { category: 'PLAN PERSONAL', budgeted: 60000, actual: 0, difference: 60000 },
    { category: 'PRESTAMO KATA', budgeted: 300000, actual: 300000, difference: 0 },
    { category: 'FOTOGRAFO', budgeted: 0, actual: 750000, difference: -750000 },
    { category: 'UENO', budgeted: 542362, actual: 0, difference: 542362 },
    { category: 'LIQUIDACION DE DECOR.', budgeted: 0, actual: 1500000, difference: -1500000 },
    { category: '2DO PAGO FOTOGRAFO', budgeted: 0, actual: 500000, difference: -500000 },
    { category: 'CONTADORA', budgeted: 200000, actual: 200000, difference: 0 },
    { category: 'ALQUILER', budgeted: 1000000, actual: 1000000, difference: 0 },
    { category: 'DIEZMO', budgeted: 350000, actual: 350000, difference: 0 },
    { category: 'ROPA MC', budgeted: 0, actual: 110000, difference: -110000 },
    { category: 'LA PIEDRA', budgeted: 0, actual: 40000, difference: -40000 },
    { category: 'CHAMBU', budgeted: 0, actual: 70000, difference: -70000 },
    { category: 'COMBUSTIBLE GERE', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'ALMUERZO SANTA ISABEL', budgeted: 0, actual: 16000, difference: -16000 },
    { category: 'ASADITO', budgeted: 0, actual: 60000, difference: -60000 },
    { category: 'PIZZA LA PIEDRA', budgeted: 0, actual: 40000, difference: -40000 },
    { category: 'CAMISETA', budgeted: 0, actual: 50000, difference: -50000 },
    { category: 'DESCUENTO', budgeted: 0, actual: 155000, difference: -155000 },
    { category: 'HAMBURGUESA', budgeted: 0, actual: 44000, difference: -44000 },
    { category: 'CAMPAÑA POLITICA', budgeted: 0, actual: 25000, difference: -25000 },
    { category: 'AYUDIN', budgeted: 0, actual: 8000, difference: -8000 },
    { category: 'TARTA FACU', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'BIGGIE', budgeted: 0, actual: 4950, difference: -4950 },
    { category: 'VIATICO GERE', budgeted: 0, actual: 80000, difference: -80000 },
    { category: 'CHORIPAN', budgeted: 0, actual: 50000, difference: -50000 },
    { category: 'MILKI', budgeted: 0, actual: 20000, difference: -20000 },
    { category: 'REGALO FRANK', budgeted: 0, actual: 52000, difference: -52000 },
    { category: 'PLAN TIGO PLAGAS', budgeted: 0, actual: 142000, difference: -142000 },
    { category: 'MERIENDA', budgeted: 0, actual: 11450, difference: -11450 },
    { category: 'VIATICO MILKI', budgeted: 0, actual: 41000, difference: -41000 },
    { category: 'CHIPA', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'VINO', budgeted: 0, actual: 27000, difference: -27000 },
    { category: 'HELADO', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'COMBUSTIBLE', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'MIGUELITO', budgeted: 0, actual: 70000, difference: -70000 },
    { category: 'VINO Y COCA', budgeted: 0, actual: 25400, difference: -25400 },
    { category: 'FRUCTIDELICIOSO', budgeted: 0, actual: 25650, difference: -25650 },
    { category: 'CANCHA', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'REGALO PAPA DE MILKI', budgeted: 0, actual: 50000, difference: -50000 },
    { category: 'CENA CUMPLE DE FRANK', budgeted: 0, actual: 70000, difference: -70000 },
    { category: 'COMBUSTIBLE AUTO', budgeted: 0, actual: 30000, difference: -30000 },
    { category: 'GOLOSINAS', budgeted: 0, actual: 7500, difference: -7500 },
    { category: 'HAMBURGUESA', budgeted: 0, actual: 20000, difference: -20000 },
    { category: 'PACK', budgeted: 0, actual: 7000, difference: -7000 },
    { category: 'SALDO', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'MERIENDA', budgeted: 0, actual: 31000, difference: -31000 },
    { category: 'PAGO GOOGLE', budgeted: 0, actual: 16000, difference: -16000 },
    { category: 'FAROLA', budgeted: 0, actual: 97000, difference: -97000 },
    { category: 'PAUTA', budgeted: 0, actual: 55107, difference: -55107 },
    { category: 'CENA', budgeted: 0, actual: 44000, difference: -44000 },
    { category: 'VIATICO COMIDA', budgeted: 0, actual: 12000, difference: -12000 },
    { category: 'REGALO GERE + OTROS', budgeted: 0, actual: 141750, difference: -141750 },
    { category: 'REGALO MILKI', budgeted: 0, actual: 15000, difference: -15000 },
    { category: 'TARJETA MAS', budgeted: 0, actual: 10000, difference: -10000 },
    { category: 'PACK PERSONAL', budgeted: 0, actual: 7000, difference: -7000 },
    { category: 'MERIENDA LA DULCERA', budgeted: 0, actual: 25000, difference: -25000 },
    { category: 'GOLOSINAS', budgeted: 0, actual: 75475, difference: -75475 },
  ],
  incomes: [
    { source: 'Sueldo', projected: 3800000, actual: 3800000, difference: 0 },
    { source: 'Super Avenida', projected: 450000, actual: 450000, difference: 0 },
    { source: 'Todo oficina', projected: 1200000, actual: 600000, difference: -600000 },
    { source: 'anticipo duplex zarate', projected: 1000000, actual: 1000000, difference: 0 },
    { source: 'CHANGA', projected: 50000, actual: 50000, difference: 0 },
    { source: 'ARTURO ASADITO', projected: 0, actual: 20000, difference: 20000 },
    { source: 'MAMA DE GERE', projected: 0, actual: 270000, difference: 270000 },
    { source: 'FOTOS A MIA', projected: 0, actual: 450000, difference: 450000 },
    { source: 'GYM', projected: 0, actual: 190000, difference: 190000 },
    { source: 'X', projected: 0, actual: 16000, difference: 16000 },
    { source: 'ASTRA IA', projected: 1000000, actual: 1000000, difference: 0 },
    { source: 'ADELANTO ESMERALDA', projected: 0, actual: 2000000, difference: 2000000 },
    { source: 'MI AROMA', projected: 0, actual: 100000, difference: 100000 },
    { source: 'BODEGA', projected: 0, actual: 280000, difference: 280000 },
    { source: 'MARIO', projected: 550000, actual: 550000, difference: 0 },
    { source: 'EFECTIVO', projected: 0, actual: 5000, difference: 5000 },
    { source: 'GUADA', projected: 816000, actual: 816000, difference: 0 },
    { source: 'X', projected: 0, actual: 150000, difference: 150000 },
    { source: 'BIANCA', projected: 0, actual: 100000, difference: 100000 },
  ]
};

// TARJETAS DE CREDITO
export const creditCards: CreditCard[] = [
  { bank: 'UENO', owner: 'GEREMIAS', totalLimit: 1000000, consumed: 1000000, remaining: 0 },
  { bank: 'UENO', owner: 'MILKI', totalLimit: 1000000, consumed: 1000000, remaining: 0 },
  { bank: 'CONTINENTAL', owner: 'GERE Y MILKI', totalLimit: 0, consumed: 0, remaining: 0 },
  { bank: 'CONTINENTAL', owner: 'MILKI', totalLimit: 0, consumed: 0, remaining: 0 },
];

// DEUDAS
export const debts: Debt[] = [
  {
    name: 'GERE UENO',
    totalAmount: 12989854,
    paid: 7617137,
    remaining: 5372717,
    status: 'active',
    installments: [
      { number: 1, amount: 547909, paid: 547909, date: '2025-08-25' },
      { number: 2, amount: 546426, paid: 546426, date: '2025-09-25' },
      { number: 3, amount: 546426, paid: 546426, date: '2025-10-28' },
      { number: 4, amount: 546326, paid: 546326, date: '2025-11-27' },
      { number: 5, amount: 545382, paid: 545382, date: '2025-12-24' },
      { number: 6, amount: 545233, paid: 545233, date: '2026-01-30' },
      { number: 7, amount: 543941, paid: 543941, date: '2026-02-28' },
      { number: 8, amount: 543755, paid: 543755, date: '2026-03-30' },
      { number: 9, amount: 543531, paid: 543531, date: '2026-04-29' },
      { number: 10, amount: 542639, paid: 542639, date: '2026-05-30' },
      { number: 11, amount: 542362, paid: 542362, date: '2026-06-29' },
      { number: 12, amount: 541493, paid: 541493, date: '2026-07-31' },
      { number: 13, amount: 541162, paid: 541162, date: '2026-08-28' },
      { number: 14, amount: 540552, paid: 540552, date: '2026-09-30' },
      { number: 15, amount: 539718, paid: 0, date: '2026-10-31' },
      { number: 16, amount: 539304, paid: 0 },
      { number: 17, amount: 538493, paid: 0 },
      { number: 18, amount: 538021, paid: 0 },
      { number: 19, amount: 537103, paid: 0 },
      { number: 20, amount: 536592, paid: 0 },
      { number: 21, amount: 536031, paid: 0 },
      { number: 22, amount: 535283, paid: 0 },
      { number: 23, amount: 534660, paid: 0 },
      { number: 24, amount: 537512, paid: 0 },
    ]
  },
  {
    name: 'MILKI UENO',
    totalAmount: 342000,
    paid: 3762000,
    remaining: -3420000,
    status: 'cancelled',
    installments: [
      { number: 1, amount: 342000, paid: 342000, date: 'NOVIEMBRE' },
      { number: 2, amount: 0, paid: 342000, date: 'DICIEMBRE' },
      { number: 3, amount: 0, paid: 342000, date: 'ENERO' },
      { number: 4, amount: 0, paid: 342000, date: 'FEBRERO' },
      { number: 5, amount: 0, paid: 342000, date: 'MARZO' },
      { number: 6, amount: 0, paid: 342000, date: 'ABRIL' },
      { number: 7, amount: 0, paid: 342000, date: 'MAYO' },
      { number: 8, amount: 0, paid: 342000, date: 'JUNIO' },
      { number: 9, amount: 0, paid: 342000, date: 'JULIO' },
      { number: 10, amount: 0, paid: 342000, date: 'AGOSTO' },
      { number: 11, amount: 0, paid: 342000, date: '2026-09-30' },
      { number: 12, amount: 0, paid: 0, date: '2026-10-30' },
      { number: 13, amount: 0, paid: 0, date: '2026-11-30' },
      { number: 14, amount: 0, paid: 0, date: '2026-12-30' },
    ]
  },
  {
    name: 'TABLET',
    totalAmount: 3470000,
    paid: 1764104,
    remaining: 1705896,
    status: 'active',
    installments: [
      { number: 1, amount: 347000, paid: 347000 },
      { number: 2, amount: 347000, paid: 347000 },
      { number: 3, amount: 347000, paid: 365000 },
      { number: 4, amount: 347000, paid: 347000 },
      { number: 5, amount: 347000, paid: 358104, date: '2026-09-22' },
      { number: 6, amount: 347000, paid: 0, date: '2026-10-22' },
      { number: 7, amount: 347000, paid: 0, date: '2026-11-22' },
      { number: 8, amount: 347000, paid: 0, date: '2026-12-22' },
      { number: 9, amount: 347000, paid: 0, date: '2027-01-22' },
      { number: 10, amount: 347000, paid: 0, date: '2027-02-22' },
    ]
  },
  {
    name: 'IPHONE',
    totalAmount: 1500000,
    paid: 0,
    remaining: 1500000,
    status: 'active',
    installments: [
      { number: 1, amount: 300000, paid: 0 },
      { number: 2, amount: 300000, paid: 0 },
      { number: 3, amount: 300000, paid: 0 },
      { number: 4, amount: 300000, paid: 0 },
      { number: 5, amount: 300000, paid: 0 },
    ]
  },
  {
    name: 'TARJETA GERE',
    totalAmount: 1000000,
    paid: 0,
    remaining: 1000000,
    status: 'active',
    installments: [
      { number: 1, amount: 1000000, paid: 0 },
    ]
  },
  {
    name: 'TARJETA MILKI',
    totalAmount: 1000000,
    paid: 0,
    remaining: 1000000,
    status: 'active',
    installments: [
      { number: 1, amount: 1000000, paid: 0 },
    ]
  },
  {
    name: 'MOTO',
    totalAmount: 490000,
    paid: 522000,
    remaining: -32000,
    status: 'cancelled',
    installments: [
      { number: 1, amount: 245000, paid: 245000 },
      { number: 2, amount: 245000, paid: 277000 },
    ]
  },
];

// CALENDARIO DE PAGOS
export const paymentSchedules: PaymentSchedule[] = [
  {
    name: 'Todo Oficina',
    period: 'Abril a Enero 2026-2027',
    pendingAmount: 600000,
    payments: [
      { month: 'Abril', day13: 600000, day30: 600000, total: 1200000, status: 'Pagado', concept: 'abril cancelado (dia 13 y 30)' },
      { month: 'Mayo-Junio', day13: 600000, day30: 600000, total: 1200000, status: 'mitad mayo y', concept: 'mayo cancelado (dia 13) y junio 1er pago (dia 30)' },
      { month: 'Junio-Julio', day13: 600000, day30: 600000, total: 1200000, status: 'Pagado', concept: 'junio 2do pago cancelado (dia 13) y julio 1er pago (dia 30)' },
      { month: 'Julio-Agosto', day13: 600000, day30: 600000, total: 1200000, status: 'Pagado', concept: 'julio 2do pago cancelado (dia 13) y agosto 1er pago (dia 30)' },
      { month: 'Agosto-Septiembre', day13: 600000, day30: 600000, total: 1200000, status: 'pagado mitad', concept: 'agosto 2do pago cancelado, septiembre falta 1er pago' },
      { month: 'Septiembre-Octubre', day13: 600000, day30: 0, total: 600000, status: 'Falta', concept: 'septiembre falta 2do pago' },
      { month: 'Octubre-Noviembre', day13: 0, day30: 0, total: 0, status: '', concept: '' },
      { month: 'Noviembre-Diciembre', day13: 0, day30: 0, total: 0, status: '', concept: '' },
      { month: 'Diciembre-Enero', day13: 0, day30: 0, total: 0, status: '', concept: '' },
    ]
  },
  {
    name: 'Herkin (WiFi)',
    period: 'Septiembre a Enero 2026-2027',
    pendingAmount: 130000,
    payments: [
      { month: 'Septiembre', day05: 130000, total: 130000, status: 'Pagado', concept: 'Instalacion + Wifi' },
      { month: 'Octubre', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Noviembre', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Diciembre', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Enero', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Febrero', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Marzo', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Abril', day05: 130000, total: 0, status: 'Falta', concept: '-' },
      { month: 'Mayo', day05: 130000, total: 0, status: 'Falta', concept: '-' },
    ]
  },
  {
    name: 'ANDE (Luz)',
    period: 'Septiembre a Enero 2026-2027',
    pendingAmount: 0,
    payments: [
      { month: 'Septiembre', day05: 0, day30: 78000, total: 0, status: 'Pagado', concept: 'consumo de luz' },
      { month: 'Octubre', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Noviembre', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Diciembre', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Enero', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Febrero', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Marzo', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Abril', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
      { month: 'Mayo', day05: 0, day30: 0, total: 0, status: 'Falta', concept: '-' },
    ]
  },
];

// HERRAMIENTAS PENDIENTES
export interface Tool {
  name: string;
  cost: number;
  paid: number;
  pending: number;
}

export const tools: Tool[] = [
  { name: 'Iphone 15 pro max', cost: 3500000, paid: 3500000, pending: 0 },
  { name: 'Camara Profesional', cost: 1500000, paid: 0, pending: 1500000 },
  { name: 'Microfono Holiryn', cost: 285000, paid: 0, pending: 285000 },
  { name: 'Kit Luces', cost: 5000000, paid: 0, pending: 5000000 },
  { name: 'RAM de 16', cost: 1000000, paid: 0, pending: 1000000 },
  { name: 'Auto', cost: 24000000, paid: 0, pending: 24000000 },
];

// TODOS LOS MESES
export const allMonths: MonthlyData[] = [
  june2026,
  july2026,
  august2026,
  september2026,
  october2026,
];

// FUNCIONES AUXILIARES
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PYG', 'Gs.');
};

export const calculateTotalDebt = (): number => {
  return debts.reduce((total, debt) => total + debt.remaining, 0);
};

export const calculateTotalToolsPending = (): number => {
  return tools.reduce((total, tool) => total + tool.pending, 0);
};

export const getMonthlyComparison = () => {
  return allMonths.map(month => ({
    month: month.month,
    year: month.year,
    savings: month.finalBalance - month.initialBalance,
    percentageChange: month.percentageChange,
    expenses: month.actualExpenses,
    income: month.actualIncome,
  }));
};
