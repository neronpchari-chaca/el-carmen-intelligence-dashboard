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

type SheetToJson = <T>(sheet: WorksheetLike, options: { header: 1; raw: true; defval: null }) => T[];

type XlsxUtilsLike = {
  sheet_to_json: SheetToJson;
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

export function detectCashFlowWorkbook(workbook: WorkbookLike, utils: XlsxUtilsLike): GenericCashFlowNormalizeResult | null {
  const candidates = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = normalizeRows(utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null }));
    return normalizeGenericWideCashFlow(sheetName, rows);
  });

  return chooseBestCashFlow(candidates);
}
