export type GenericCashFlowCell = string | number | null | undefined;

export type GenericCashFlowRow = GenericCashFlowCell[];

export type GenericCashFlowRecord = {
  period: string;
  concept: string;
  type: 'Entrada' | 'Salida' | 'Revisar';
  income: number;
  expense: number;
  net: number;
  sourceSheet: string;
  sourceRow: number;
};

export type GenericCashFlowIssue = {
  group: 'estructura' | 'conceptos' | 'importes' | 'validacion';
  title: string;
  detail: string;
  count: number;
};

export type GenericCashFlowNormalizeResult = {
  sourceSheet: string;
  monthRange: string;
  records: GenericCashFlowRecord[];
  monthlySummary: Array<{
    period: string;
    records: number;
    income: number;
    expense: number;
    net: number;
  }>;
  issues: GenericCashFlowIssue[];
};

const MONTH_PATTERN = /^[a-z]{3}-\d{2}$/i;
const MONTH_ABBREVIATIONS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

const normalizeText = (value: GenericCashFlowCell) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const normalizeMonth = (value: GenericCashFlowCell): string | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 30000 && value < 60000) {
    const date = new Date(EXCEL_EPOCH_UTC + value * 24 * 60 * 60 * 1000);
    return `${MONTH_ABBREVIATIONS[date.getUTCMonth()]}-${String(date.getUTCFullYear()).slice(-2)}`;
  }

  const normalized = normalizeText(value)
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace('.', '');

  return MONTH_PATTERN.test(normalized) ? normalized : null;
};

const parseAmount = (value: GenericCashFlowCell): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  const text = String(value ?? '')
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const formatMonthRange = (months: string[]) => {
  if (months.length === 0) return 'No detectado';
  if (months.length === 1) return months[0];
  return `${months[0]} a ${months[months.length - 1]}`;
};

const findMonthHeaderRow = (rows: GenericCashFlowRow[]) =>
  rows
    .map((row, rowIndex) => ({
      row,
      rowIndex,
      monthIndexes: row
        .map((cell, index) => ({ period: normalizeMonth(cell), index }))
        .filter((item): item is { period: string; index: number } => Boolean(item.period)),
    }))
    .find((candidate) => candidate.monthIndexes.length >= 2);

const buildConcept = (row: GenericCashFlowRow, firstMonthIndex: number) =>
  row
    .slice(0, Math.max(firstMonthIndex, 1))
    .map((cell) => String(cell ?? '').trim())
    .filter(Boolean)
    .join(' / ');

const detectSection = (concept: string): GenericCashFlowRecord['type'] | null => {
  const normalized = normalizeText(concept);

  if (/^(entradas?|ingresos?|receitas?)(\b|\s*\/)/.test(normalized)) return 'Entrada';
  if (/^(saidas?|salidas?|egresos?|despesas?|gastos?)(\b|\s*\/)/.test(normalized)) return 'Salida';

  return null;
};

const isBalanceOrTotalRow = (concept: string) => {
  const normalized = normalizeText(concept);

  return (
    /\bsaldo\b/.test(normalized) ||
    /\bacumulado\b/.test(normalized) ||
    /^neto\b/.test(normalized) ||
    /^resultado\b/.test(normalized) ||
    /^total\b/.test(normalized) ||
    /^flujo\b/.test(normalized) ||
    /^fluxo\b/.test(normalized)
  );
};

const addIssue = (issues: GenericCashFlowIssue[], issue: GenericCashFlowIssue) => {
  const current = issues.find((item) => item.group === issue.group && item.title === issue.title);
  if (current) {
    current.count += issue.count;
    return;
  }

  issues.push(issue);
};

const buildRecord = (
  sourceSheet: string,
  sourceRow: number,
  period: string,
  concept: string,
  amount: number,
  section: GenericCashFlowRecord['type'] | null,
): GenericCashFlowRecord => {
  if (section === 'Entrada') {
    const income = Math.abs(amount);
    return { period, concept, type: 'Entrada', income, expense: 0, net: income, sourceSheet, sourceRow };
  }

  if (section === 'Salida') {
    const expense = Math.abs(amount);
    return { period, concept, type: 'Salida', income: 0, expense, net: -expense, sourceSheet, sourceRow };
  }

  const type: GenericCashFlowRecord['type'] = amount > 0 ? 'Entrada' : amount < 0 ? 'Salida' : 'Revisar';
  return {
    period,
    concept,
    type,
    income: amount > 0 ? amount : 0,
    expense: amount < 0 ? Math.abs(amount) : 0,
    net: amount,
    sourceSheet,
    sourceRow,
  };
};

export function normalizeGenericWideCashFlow(sourceSheet: string, rows: GenericCashFlowRow[]): GenericCashFlowNormalizeResult {
  const issues: GenericCashFlowIssue[] = [];
  const header = findMonthHeaderRow(rows);

  if (!header) {
    return {
      sourceSheet,
      monthRange: 'No detectado',
      records: [],
      monthlySummary: [],
      issues: [
        {
          group: 'estructura',
          title: 'No se detectaron meses',
          detail: 'La hoja no tiene columnas mensuales claras como mar-26, abr-26 o fechas de Excel.',
          count: 1,
        },
      ],
    };
  }

  const firstMonthIndex = header.monthIndexes[0]?.index ?? 1;
  const records: GenericCashFlowRecord[] = [];
  let currentSection: GenericCashFlowRecord['type'] | null = null;

  rows.slice(header.rowIndex + 1).forEach((row, offset) => {
    const sourceRow = header.rowIndex + offset + 2;
    const concept = buildConcept(row, firstMonthIndex);

    if (!concept) {
      const hasAmount = header.monthIndexes.some((item) => parseAmount(row[item.index]) !== 0);
      if (hasAmount) {
        addIssue(issues, {
          group: 'conceptos',
          title: 'Importes sin concepto',
          detail: 'Hay filas con importes, pero sin descripcion clara para armar la cuenta o concepto.',
          count: 1,
        });
      }
      return;
    }

    const section = detectSection(concept);
    if (section && !concept.includes('/')) {
      currentSection = section;
      return;
    }

    if (isBalanceOrTotalRow(concept)) return;

    header.monthIndexes.forEach(({ period, index }) => {
      const amount = roundMoney(parseAmount(row[index]));
      if (amount === 0) return;

      records.push(buildRecord(sourceSheet, sourceRow, period, concept, amount, section ?? currentSection));
    });
  });

  if (records.length === 0) {
    addIssue(issues, {
      group: 'importes',
      title: 'No hay movimientos normalizados',
      detail: 'Se detectaron meses, pero no se encontraron importes con concepto para armar registros.',
      count: 1,
    });
  }

  const summaryByPeriod = new Map<string, GenericCashFlowNormalizeResult['monthlySummary'][number]>();

  for (const record of records) {
    const current = summaryByPeriod.get(record.period) ?? {
      period: record.period,
      records: 0,
      income: 0,
      expense: 0,
      net: 0,
    };
    current.records += 1;
    current.income = roundMoney(current.income + record.income);
    current.expense = roundMoney(current.expense + record.expense);
    current.net = roundMoney(current.net + record.net);
    summaryByPeriod.set(record.period, current);
  }

  return {
    sourceSheet,
    monthRange: formatMonthRange(header.monthIndexes.map((item) => item.period)),
    records,
    monthlySummary: Array.from(summaryByPeriod.values()),
    issues,
  };
}
