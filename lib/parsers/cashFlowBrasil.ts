export type CashFlowBrasilCell = string | number | null | undefined;

export type CashFlowBrasilRow = CashFlowBrasilCell[];

export type CashFlowBrasilRecord = {
  period: string;
  country: 'Brasil';
  currency: 'BRL';
  type: 'Entrada' | 'Salida';
  group: string;
  account: string;
  income: number;
  expense: number;
  net: number;
  sourceFile: string;
  sourceRow?: number;
};

export type CashFlowBrasilBalanceCheck = {
  period: string;
  openingBalance: number;
  normalizedNet: number;
  spreadsheetNet?: number;
  netDifference?: number;
  closingBalance: number;
  calculatedClosingBalance: number;
  difference: number;
  status: 'ok' | 'difference';
};

export type CashFlowBrasilParseResult = {
  sourceFile: string;
  records: CashFlowBrasilRecord[];
  monthlySummary: Array<{
    period: string;
    records: number;
    income: number;
    expense: number;
    net: number;
  }>;
  balanceChecks: CashFlowBrasilBalanceCheck[];
  warnings: string[];
};

type ParseInput = {
  sourceFile: string;
  mapaCuentasRows: CashFlowBrasilRow[];
  hoja1Rows?: CashFlowBrasilRow[];
};

type BalanceRowMatch = {
  row: CashFlowBrasilRow;
  labelIndex: number;
};

const MONTH_PATTERN = /^[a-z]{3}-\d{2}$/i;
const MONTH_ABBREVIATIONS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

const normalizeText = (value: CashFlowBrasilCell) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const parseAmount = (value: CashFlowBrasilCell): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;

  const text = String(value)
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  if (!text) return 0;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const findHeaderIndex = (headers: string[], candidates: string[]) =>
  headers.findIndex((header) => candidates.includes(normalizeText(header)));

const normalizeMonthHeader = (value: CashFlowBrasilCell): string | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 30000 && value < 60000) {
    const date = new Date(EXCEL_EPOCH_UTC + value * 24 * 60 * 60 * 1000);
    const month = MONTH_ABBREVIATIONS[date.getUTCMonth()];
    const year = String(date.getUTCFullYear()).slice(-2);
    return `${month}-${year}`;
  }

  const normalized = normalizeText(value)
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace('.', '');

  return MONTH_PATTERN.test(normalized) ? normalized : null;
};

const isMonthHeader = (value: CashFlowBrasilCell) => normalizeMonthHeader(value) !== null;

const isAmountLike = (value: CashFlowBrasilCell) => {
  if (typeof value === 'number') return Number.isFinite(value);
  const text = String(value ?? '').trim();
  return /-?\s*(R\$)?\s*\d[\d.,]*/i.test(text);
};

const findBalanceRow = (rows: CashFlowBrasilRow[], label: string): BalanceRowMatch | undefined => {
  const target = normalizeText(label);

  for (const row of rows) {
    const labelIndex = row.findIndex((cell) => {
      const normalized = normalizeText(cell);
      return normalized === target || normalized.includes(target);
    });

    if (labelIndex >= 0) return { row, labelIndex };
  }

  return undefined;
};

const findMonthHeaderRow = (rows: CashFlowBrasilRow[]) =>
  rows.find((row) => row.filter(isMonthHeader).length >= 3);

export function parseCashFlowBrasil(input: ParseInput): CashFlowBrasilParseResult {
  const warnings: string[] = [];
  const [headerRow, ...dataRows] = input.mapaCuentasRows;

  if (!headerRow) {
    return {
      sourceFile: input.sourceFile,
      records: [],
      monthlySummary: [],
      balanceChecks: [],
      warnings: ['La hoja Mapa cuentas no tiene encabezados.'],
    };
  }

  const headers = headerRow.map((cell) => String(cell ?? ''));
  const typeIndex = findHeaderIndex(headers, ['tipo']);
  const groupIndex = findHeaderIndex(headers, ['grupo']);
  const accountIndex = findHeaderIndex(headers, ['cuenta']);
  const sourceRowIndex = findHeaderIndex(headers, ['fila origen']);
  const monthIndexes = headers
    .map((header, index) => ({ header: normalizeMonthHeader(header) ?? header.trim(), index }))
    .filter(({ header }) => MONTH_PATTERN.test(header));

  if (typeIndex < 0) warnings.push('No se encontro la columna Tipo.');
  if (groupIndex < 0) warnings.push('No se encontro la columna Grupo.');
  if (accountIndex < 0) warnings.push('No se encontro la columna Cuenta.');
  if (monthIndexes.length === 0) warnings.push('No se encontraron columnas mensuales tipo mar-26.');

  const records = dataRows.flatMap((row) => {
    const rawType = normalizeText(row[typeIndex]);
    const type: 'Entrada' | 'Salida' = rawType.includes('entrada') ? 'Entrada' : 'Salida';
    const group = String(row[groupIndex] ?? '').trim();
    const account = String(row[accountIndex] ?? '').trim();
    const sourceRow = sourceRowIndex >= 0 ? Number(row[sourceRowIndex]) || undefined : undefined;

    if (!rawType || !account) return [];

    return monthIndexes.flatMap(({ header, index }) => {
      const amount = parseAmount(row[index]);
      if (amount === 0) return [];

      return [{
        period: header,
        country: 'Brasil' as const,
        currency: 'BRL' as const,
        type,
        group,
        account,
        income: amount > 0 ? roundMoney(amount) : 0,
        expense: amount < 0 ? roundMoney(Math.abs(amount)) : 0,
        net: roundMoney(amount),
        sourceFile: input.sourceFile,
        sourceRow,
      }];
    });
  });

  const summaryByPeriod = new Map<string, { period: string; records: number; income: number; expense: number; net: number }>();

  for (const record of records) {
    const current = summaryByPeriod.get(record.period) ?? { period: record.period, records: 0, income: 0, expense: 0, net: 0 };
    current.records += 1;
    current.income = roundMoney(current.income + record.income);
    current.expense = roundMoney(current.expense + record.expense);
    current.net = roundMoney(current.net + record.net);
    summaryByPeriod.set(record.period, current);
  }

  const monthlySummary = Array.from(summaryByPeriod.values());
  const balanceChecks = input.hoja1Rows ? buildBalanceChecks(input.hoja1Rows, monthlySummary, warnings) : [];

  return {
    sourceFile: input.sourceFile,
    records,
    monthlySummary,
    balanceChecks,
    warnings,
  };
}

function buildBalanceChecks(
  hoja1Rows: CashFlowBrasilRow[],
  monthlySummary: CashFlowBrasilParseResult['monthlySummary'],
  warnings: string[],
): CashFlowBrasilBalanceCheck[] {
  const headerRow = findMonthHeaderRow(hoja1Rows);
  const openingMatch = findBalanceRow(hoja1Rows, 'saldo anterior');
  const closingMatch = findBalanceRow(hoja1Rows, 'saldo final');
  const netMatch = findBalanceRow(hoja1Rows, 'neto del m') ?? findBalanceRow(hoja1Rows, 'neto del mes');

  if (!headerRow || !openingMatch || !closingMatch) {
    warnings.push('No se pudieron detectar saldos para validar saldo anterior + neto = saldo final.');
    return [];
  }

  const netByPeriod = new Map(monthlySummary.map((summary) => [summary.period, summary.net]));

  return headerRow.flatMap((cell, index) => {
    const period = normalizeMonthHeader(cell);
    if (!period) return [];

    const openingValueIndex = resolveBalanceValueIndex(openingMatch, index);
    const closingValueIndex = resolveBalanceValueIndex(closingMatch, index);
    const netValueIndex = netMatch ? resolveBalanceValueIndex(netMatch, index) : undefined;
    const openingBalance = roundMoney(parseAmount(openingMatch.row[openingValueIndex]));
    const closingBalance = roundMoney(parseAmount(closingMatch.row[closingValueIndex]));
    const normalizedNet = roundMoney(netByPeriod.get(period) ?? 0);
    const spreadsheetNet = netValueIndex === undefined ? undefined : roundMoney(parseAmount(netMatch?.row[netValueIndex]));
    const netDifference = spreadsheetNet === undefined ? undefined : roundMoney(spreadsheetNet - normalizedNet);
    const calculatedClosingBalance = roundMoney(openingBalance + normalizedNet);
    const difference = roundMoney(closingBalance - calculatedClosingBalance);
    const hasNetDifference = netDifference !== undefined && Math.abs(netDifference) > 0.01;

    return [{
      period,
      openingBalance,
      normalizedNet,
      spreadsheetNet,
      netDifference,
      closingBalance,
      calculatedClosingBalance,
      difference,
      status: Math.abs(difference) <= 0.01 && !hasNetDifference ? 'ok' as const : 'difference' as const,
    }];
  });
}

function resolveBalanceValueIndex(match: BalanceRowMatch, monthIndex: number) {
  if (isAmountLike(match.row[monthIndex])) return monthIndex;

  const nextIndex = monthIndex + 1;
  if (isAmountLike(match.row[nextIndex])) return nextIndex;

  return monthIndex <= match.labelIndex ? monthIndex + 1 : monthIndex;
}
