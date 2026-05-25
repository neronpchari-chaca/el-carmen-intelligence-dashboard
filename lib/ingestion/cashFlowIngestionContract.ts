export type CashFlowIngestionStatus = 'publicable' | 'review_required' | 'not_interpretable';

export type CashFlowSourceReference = {
  sheet: string;
  row?: number;
  column?: number;
  label?: string;
};

export type CashFlowOriginalWorkbookEvidence = {
  fileName: string;
  sheets: Array<{
    name: string;
    rowCount: number;
    columnCount: number;
  }>;
  detectedMonthColumns: Array<CashFlowSourceReference & { period: string }>;
  detectedControlRows: Array<CashFlowSourceReference & { kind: 'income_total' | 'expense_total' | 'net' | 'opening_balance' | 'closing_balance' | 'other' }>;
};

export type CashFlowProposedMonthlySummary = {
  period: string;
  income: number;
  expense: number;
  net: number;
  openingBalance?: number;
  closingBalance?: number;
};

export type CashFlowReadingProposal = {
  formatDetected: 'grouped_cash_flow' | 'detailed_cash_flow' | 'cash_flow_with_controls' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  usedRows: CashFlowSourceReference[];
  excludedRows: Array<CashFlowSourceReference & { reason: string }>;
  usedColumns: CashFlowSourceReference[];
  excludedColumns: Array<CashFlowSourceReference & { reason: string }>;
  monthlySummary: CashFlowProposedMonthlySummary[];
  explanation: string;
};

export type CashFlowVerificationCheck = {
  label: string;
  status: 'passed' | 'failed' | 'not_available';
  period?: string;
  expected?: number;
  actual?: number;
  difference?: number;
  detail: string;
};

export type CashFlowOriginalVerification = {
  status: CashFlowIngestionStatus;
  checks: CashFlowVerificationCheck[];
  blockingReasons: string[];
};

export type CashFlowIngestionDecision = {
  source: CashFlowOriginalWorkbookEvidence;
  proposal: CashFlowReadingProposal;
  verification: CashFlowOriginalVerification;
  canPublish: boolean;
  userMessage: string;
};

export function decideCashFlowPublication(verification: CashFlowOriginalVerification): Pick<CashFlowIngestionDecision, 'canPublish' | 'userMessage'> {
  if (verification.status === 'publicable') {
    return {
      canPublish: true,
      userMessage: 'Lectura validada contra el archivo original. Lista para publicar.',
    };
  }

  if (verification.status === 'review_required') {
    return {
      canPublish: false,
      userMessage: 'La IA propuso una lectura, pero hay diferencias contra el archivo original. Revisar antes de publicar.',
    };
  }

  return {
    canPublish: false,
    userMessage: 'No pude interpretar el archivo con confianza suficiente. Subi una version mas clara o marca manualmente las secciones.',
  };
}
