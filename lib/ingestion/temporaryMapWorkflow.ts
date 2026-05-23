import {
  normalizeGenericWideCashFlow,
  type GenericCashFlowNormalizeResult,
  type GenericCashFlowRow,
} from '@/lib/parsers/genericWideCashFlow';

export type TemporaryMapReviewStatus = 'ready-for-validation' | 'needs-review';

export type TemporaryMapReviewResult = {
  status: TemporaryMapReviewStatus;
  sourceSheet: string;
  monthRange: string;
  recordsDetected: number;
  previewRows: Array<{
    period: string;
    concept: string;
    type: 'Entrada' | 'Salida' | 'Revisar';
    income: number;
    expense: number;
    net: number;
  }>;
  monthlySummary: GenericCashFlowNormalizeResult['monthlySummary'];
  issueGroups: Array<{
    title: string;
    detail: string;
    count: number;
  }>;
  nextAction: string;
};

const MAX_PREVIEW_ROWS = 12;

export function buildTemporaryMapReview(sourceSheet: string, rows: GenericCashFlowRow[]): TemporaryMapReviewResult {
  const normalized = normalizeGenericWideCashFlow(sourceSheet, rows);
  const hasBlockingIssues = normalized.issues.length > 0 || normalized.records.length === 0;

  return {
    status: hasBlockingIssues ? 'needs-review' : 'ready-for-validation',
    sourceSheet: normalized.sourceSheet,
    monthRange: normalized.monthRange,
    recordsDetected: normalized.records.length,
    previewRows: normalized.records.slice(0, MAX_PREVIEW_ROWS).map((record) => ({
      period: record.period,
      concept: record.concept,
      type: record.type,
      income: record.income,
      expense: record.expense,
      net: record.net,
    })),
    monthlySummary: normalized.monthlySummary,
    issueGroups: normalized.issues.map((issue) => ({
      title: issue.title,
      detail: issue.detail,
      count: issue.count,
    })),
    nextAction: hasBlockingIssues
      ? 'Revisar los grupos observados antes de validar la carga.'
      : 'La propuesta ya puede pasar a validacion de saldos y aprobacion humana.',
  };
}
