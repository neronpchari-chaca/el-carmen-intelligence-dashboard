import {
  normalizeGenericWideCashFlow,
  type GenericCashFlowCell,
  type GenericCashFlowNormalizeResult,
  type GenericCashFlowRow,
} from '@/lib/parsers/genericWideCashFlow';

type WorksheetLike = unknown;

type WorkbookLike = {
  SheetNames: string[];
  Sheets: Record<string, WorksheetLike>;
};

type XlsxModuleLike = {
  read: (data: ArrayBuffer, options: { type: 'array' }) => WorkbookLike;
  utils: {
    sheet_to_json: (sheet: WorksheetLike, options: { header: 1; raw: true; defval: null }) => unknown[];
  };
};

const normalizeRows = (rows: unknown[][]): GenericCashFlowRow[] =>
  rows.map((row) => row.map((cell): GenericCashFlowCell => (typeof cell === 'number' || typeof cell === 'string' ? cell : cell == null ? null : String(cell))));

const chooseBestCashFlow = (candidates: GenericCashFlowNormalizeResult[]) => {
  const withRecords = candidates.filter((candidate) => candidate.records.length > 0);
  const pool = withRecords.length ? withRecords : candidates;

  return pool.sort((a, b) => {
    if (b.records.length !== a.records.length) return b.records.length - a.records.length;
    return a.issues.length - b.issues.length;
  })[0] ?? null;
};

export function detectCashFlowWorkbook(workbook: WorkbookLike, xlsx: XlsxModuleLike): GenericCashFlowNormalizeResult | null {
  const candidates = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = normalizeRows(xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null }) as unknown[][]);
    return normalizeGenericWideCashFlow(sheetName, rows);
  });

  return chooseBestCashFlow(candidates);
}

export async function detectCashFlowFile(file: File): Promise<GenericCashFlowNormalizeResult | null> {
  const XLSX = (await import('xlsx')) as XlsxModuleLike;
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  return detectCashFlowWorkbook(workbook, XLSX);
}
