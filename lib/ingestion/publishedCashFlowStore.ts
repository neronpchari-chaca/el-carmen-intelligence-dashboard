import type {
  GenericCashFlowIssue,
  GenericCashFlowNormalizeResult,
  GenericCashFlowReadingDiagnostic,
  GenericCashFlowReconciliation,
  GenericCashFlowRecord,
} from '@/lib/parsers/genericWideCashFlow';

export type PublishedCashFlowSnapshot = {
  sourceFile: string;
  publishedAt: string;
  monthRange: string;
  recordCount: number;
  monthlySummary: GenericCashFlowNormalizeResult['monthlySummary'];
  balanceSummary?: GenericCashFlowNormalizeResult['balanceSummary'];
  reconciliation?: GenericCashFlowReconciliation[];
  readingDiagnostic?: GenericCashFlowReadingDiagnostic;
  records?: GenericCashFlowRecord[];
  previewRows: GenericCashFlowRecord[];
  issues: GenericCashFlowIssue[];
  totals: {
    income: number;
    expense: number;
    net: number;
  };
};

const STORAGE_KEY = 'el-carmen.published-cash-flow.v1';

export function savePublishedCashFlow(snapshot: PublishedCashFlowSnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadPublishedCashFlow(): PublishedCashFlowSnapshot | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PublishedCashFlowSnapshot;
  } catch {
    return null;
  }
}
