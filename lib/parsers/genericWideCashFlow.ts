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

export type GenericCashFlowReadingDiagnostic = {
  confidence: 'alta' | 'media' | 'baja';
  confidenceScore: number;
  reasons: string[];
  detectedRows: {
    headerRow: number;
    entradaRow: number | null;
    salidaRow: number | null;
    saldoFinalRow: number | null;
    excludedRows: number;
  };
  excludedSamples: Array<{
    row: number;
    concept: string;
    reason: string;
  }>;
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
  balanceSummary: Array<{
    period: string;
    closingBalance: number;
  }>;
  issues: GenericCashFlowIssue[];
  readingDiagnostic: GenericCashFlowReadingDiagnostic;
};

type ControlTotalsByPeriod = Map<string, { income?: number; expense?: number; net?: number }>;

const MONTH_PATTERN = /^[a-z]{3}-\d{2}$/i;
const MONTH_ABBREVIATIONS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
const MONEY_TOLERANCE = 0.05;

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

const getPrimaryConceptCell = (row: GenericCashFlowRow, firstMonthIndex: number) =>
  row.slice(0, Math.max(firstMonthIndex, 1)).find((cell) => String(cell ?? '').trim().length > 0);

const isIndentedConceptRow = (row: GenericCashFlowRow, firstMonthIndex: number) => {
  const cell = getPrimaryConceptCell(row, firstMonthIndex);
  return typeof cell === 'string' && /^\s+\S/.test(cell);
};

const detectSection = (concept: string): GenericCashFlowRecord['type'] | null => {
  const normalized = normalizeText(concept);

  if (/^(entradas?|ingresos?|receitas?)(\b|\s*\/)/.test(normalized)) return 'Entrada';
  if (/^(saidas?|salidas?|egresos?|despesas?|gastos?)(\b|\s*\/)/.test(normalized)) return 'Salida';

  return null;
};

const isClosingBalanceRow = (concept: string) => /\bsaldo\s+final\b/.test(normalizeText(concept));
const isPreviousBalanceRow = (concept: string) => /\bsaldo\s+anterior\b/.test(normalizeText(concept)) || /\bacumulado\b/.test(normalizeText(concept));
const isIncomeTotalRow = (concept: string) => /^total\s+(entradas?|ingresos?|receitas?)\b/.test(normalizeText(concept));
const isExpenseTotalRow = (concept: string) => /^total\s+(saidas?|salidas?|egresos?|despesas?|gastos?)\b/.test(normalizeText(concept));
const isNetControlRow = (concept: string) => /^neto\b/.test(normalizeText(concept)) || /^resultado\b/.test(normalizeText(concept));

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

const hasAnyMonthlyAmount = (row: GenericCashFlowRow, monthIndexes: Array<{ period: string; index: number }>) =>
  monthIndexes.some((item) => parseAmount(row[item.index]) !== 0);

const findNextConceptRow = (rows: GenericCashFlowRow[], startIndex: number, firstMonthIndex: number) => {
  for (let index = startIndex; index < rows.length; index += 1) {
    const concept = buildConcept(rows[index] ?? [], firstMonthIndex);
    if (concept) return { row: rows[index] ?? [], concept, index };
  }

  return null;
};

const hasIndentedDetailAfter = (rows: GenericCashFlowRow[], rowIndex: number, firstMonthIndex: number) => {
  const next = findNextConceptRow(rows, rowIndex + 1, firstMonthIndex);
  if (!next) return false;
  if (detectSection(next.concept) && !next.concept.includes('/')) return false;
  if (isBalanceOrTotalRow(next.concept)) return false;

  return isIndentedConceptRow(next.row, firstMonthIndex);
};

const addIssue = (issues: GenericCashFlowIssue[], issue: GenericCashFlowIssue) => {
  const current = issues.find((item) => item.group === issue.group && item.title === issue.title);
  if (current) {
    current.count += issue.count;
    return;
  }

  issues.push(issue);
};

const captureControlTotals = (
  totalsByPeriod: ControlTotalsByPeriod,
  row: GenericCashFlowRow,
  monthIndexes: Array<{ period: string; index: number }>,
  field: 'income' | 'expense' | 'net',
) => {
  monthIndexes.forEach(({ period, index }) => {
    const current = totalsByPeriod.get(period) ?? {};
    current[field] = roundMoney(Math.abs(parseAmount(row[index])));
    if (field === 'net') current[field] = roundMoney(parseAmount(row[index]));
    totalsByPeriod.set(period, current);
  });
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

const buildReadingDiagnostic = ({
  headerRow,
  monthCount,
  recordCount,
  issueCount,
  entradaRow,
  salidaRow,
  saldoFinalRow,
  excludedRows,
  excludedSamples,
  groupedRows,
  validatedControls,
}: {
  headerRow: number;
  monthCount: number;
  recordCount: number;
  issueCount: number;
  entradaRow: number | null;
  salidaRow: number | null;
  saldoFinalRow: number | null;
  excludedRows: number;
  excludedSamples: GenericCashFlowReadingDiagnostic['excludedSamples'];
  groupedRows: number;
  validatedControls: number;
}): GenericCashFlowReadingDiagnostic => {
  const reasons: string[] = [];
  let score = 0;

  if (monthCount >= 2) {
    score += 20;
    reasons.push(`Se detectaron ${monthCount} columnas mensuales.`);
  }
  if (recordCount > 0) {
    score += 25;
    reasons.push(`Se normalizaron ${recordCount} movimientos.`);
  }
  if (entradaRow) {
    score += 15;
    reasons.push(`Se detecto seccion de entradas en fila ${entradaRow}.`);
  }
  if (salidaRow) {
    score += 15;
    reasons.push(`Se detecto seccion de salidas en fila ${salidaRow}.`);
  }
  if (saldoFinalRow) {
    score += 15;
    reasons.push(`Se detecto saldo final en fila ${saldoFinalRow}.`);
  }
  if (groupedRows > 0) {
    score += 5;
    reasons.push(`Se excluyeron ${groupedRows} fila(s) agrupadoras para evitar doble conteo.`);
  }
  if (validatedControls > 0) {
    score += 10;
    reasons.push(`Se validaron ${validatedControls} total(es) informados contra el detalle.`);
  }
  if (issueCount === 0) score += 10;
  if (issueCount > 0) reasons.push(`Quedan ${issueCount} observacion(es) por revisar.`);

  const confidenceScore = Math.max(0, Math.min(100, score));
  const confidence = confidenceScore >= 80 ? 'alta' : confidenceScore >= 55 ? 'media' : 'baja';

  return {
    confidence,
    confidenceScore,
    reasons,
    detectedRows: { headerRow, entradaRow, salidaRow, saldoFinalRow, excludedRows },
    excludedSamples: excludedSamples.slice(0, 8),
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
      balanceSummary: [],
      issues: [
        {
          group: 'estructura',
          title: 'No se detectaron meses',
          detail: 'La hoja no tiene columnas mensuales claras como mar-26, abr-26 o fechas de Excel.',
          count: 1,
        },
      ],
      readingDiagnostic: {
        confidence: 'baja',
        confidenceScore: 0,
        reasons: ['No se detectaron columnas mensuales.'],
        detectedRows: { headerRow: 0, entradaRow: null, salidaRow: null, saldoFinalRow: null, excludedRows: 0 },
        excludedSamples: [],
      },
    };
  }

  const firstMonthIndex = header.monthIndexes[0]?.index ?? 1;
  const records: GenericCashFlowRecord[] = [];
  const balanceSummary: GenericCashFlowNormalizeResult['balanceSummary'] = [];
  const controlTotalsByPeriod: ControlTotalsByPeriod = new Map();
  const excludedSamples: GenericCashFlowReadingDiagnostic['excludedSamples'] = [];
  let excludedRows = 0;
  let groupedRows = 0;
  let validatedControls = 0;
  let currentSection: GenericCashFlowRecord['type'] | null = null;
  let entradaRow: number | null = null;
  let salidaRow: number | null = null;
  let saldoFinalRow: number | null = null;

  rows.slice(header.rowIndex + 1).forEach((row, offset) => {
    const absoluteRowIndex = header.rowIndex + offset + 1;
    const sourceRow = absoluteRowIndex + 1;
    const concept = buildConcept(row, firstMonthIndex);

    if (!concept) {
      const hasAmount = hasAnyMonthlyAmount(row, header.monthIndexes);
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
      if (section === 'Entrada') entradaRow = sourceRow;
      if (section === 'Salida') salidaRow = sourceRow;
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Encabezado de seccion' });
      return;
    }

    if (isIncomeTotalRow(concept)) {
      captureControlTotals(controlTotalsByPeriod, row, header.monthIndexes, 'income');
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Total de ingresos usado como control' });
      return;
    }

    if (isExpenseTotalRow(concept)) {
      captureControlTotals(controlTotalsByPeriod, row, header.monthIndexes, 'expense');
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Total de salidas usado como control' });
      return;
    }

    if (isNetControlRow(concept)) {
      captureControlTotals(controlTotalsByPeriod, row, header.monthIndexes, 'net');
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Neto de control, no movimiento' });
      return;
    }

    if (isClosingBalanceRow(concept)) {
      saldoFinalRow = sourceRow;
      header.monthIndexes.forEach(({ period, index }) => {
        balanceSummary.push({ period, closingBalance: roundMoney(parseAmount(row[index])) });
      });
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Saldo de control, no movimiento' });
      return;
    }

    if (isPreviousBalanceRow(concept)) {
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Saldo anterior de control, no movimiento' });
      return;
    }

    if (isBalanceOrTotalRow(concept)) {
      excludedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Saldo, total o resumen excluido' });
      return;
    }

    if (!isIndentedConceptRow(row, firstMonthIndex) && hasIndentedDetailAfter(rows, absoluteRowIndex, firstMonthIndex)) {
      excludedRows += 1;
      groupedRows += 1;
      excludedSamples.push({ row: sourceRow, concept, reason: 'Fila agrupadora excluida para evitar doble conteo' });
      return;
    }

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

  for (const [period, controls] of controlTotalsByPeriod) {
    const summary = summaryByPeriod.get(period);
    if (!summary) continue;

    if (controls.income !== undefined) {
      const difference = roundMoney(summary.income - controls.income);
      if (Math.abs(difference) <= MONEY_TOLERANCE) validatedControls += 1;
      if (Math.abs(difference) > MONEY_TOLERANCE) {
        addIssue(issues, {
          group: 'validacion',
          title: 'Ingresos no coinciden con el total informado',
          detail: `${period}: la suma de ingresos da ${summary.income}, pero el total informado es ${controls.income}. Diferencia ${difference}.`,
          count: 1,
        });
      }
    }

    if (controls.expense !== undefined) {
      const difference = roundMoney(summary.expense - controls.expense);
      if (Math.abs(difference) <= MONEY_TOLERANCE) validatedControls += 1;
      if (Math.abs(difference) > MONEY_TOLERANCE) {
        addIssue(issues, {
          group: 'validacion',
          title: 'Salidas no coinciden con el total informado',
          detail: `${period}: la suma de salidas da ${summary.expense}, pero el total informado es ${controls.expense}. Diferencia ${difference}.`,
          count: 1,
        });
      }
    }

    if (controls.net !== undefined) {
      const difference = roundMoney(summary.net - controls.net);
      if (Math.abs(difference) <= MONEY_TOLERANCE) validatedControls += 1;
      if (Math.abs(difference) > MONEY_TOLERANCE) {
        addIssue(issues, {
          group: 'validacion',
          title: 'Neto no coincide con el total informado',
          detail: `${period}: ingresos menos salidas da ${summary.net}, pero el neto informado es ${controls.net}. Diferencia ${difference}.`,
          count: 1,
        });
      }
    }
  }

  return {
    sourceSheet,
    monthRange: formatMonthRange(header.monthIndexes.map((item) => item.period)),
    records,
    monthlySummary: Array.from(summaryByPeriod.values()),
    balanceSummary,
    issues,
    readingDiagnostic: buildReadingDiagnostic({
      headerRow: header.rowIndex + 1,
      monthCount: header.monthIndexes.length,
      recordCount: records.length,
      issueCount: issues.length,
      entradaRow,
      salidaRow,
      saldoFinalRow,
      excludedRows,
      excludedSamples,
      groupedRows,
      validatedControls,
    }),
  };
}
