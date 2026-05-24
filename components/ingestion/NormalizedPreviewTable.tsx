import type { GenericCashFlowRecord } from '@/lib/parsers/genericWideCashFlow';

type NormalizedPreviewRow = Pick<GenericCashFlowRecord, 'period' | 'concept' | 'type' | 'income' | 'expense' | 'net'>;

type NormalizedPreviewTableProps = {
  rows: NormalizedPreviewRow[];
  totalRecords: number;
};

const formatMoney = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function NormalizedPreviewTable({ rows, totalRecords }: NormalizedPreviewTableProps) {
  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Preview normalizado</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Datos que entrarian al modelo estandar</h2>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          {totalRecords} movimientos
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm text-zinc-300">
          <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-3 py-2 text-left">Periodo</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Concepto</th>
              <th className="px-3 py-2 text-right">Ingreso</th>
              <th className="px-3 py-2 text-right">Egreso</th>
              <th className="px-3 py-2 text-right">Neto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.period}-${row.concept}-${row.net}`} className="border-t border-zinc-800">
                <td className="px-3 py-3">{row.period}</td>
                <td className="px-3 py-3 text-emerald-200">{row.type}</td>
                <td className="px-3 py-3">{row.concept}</td>
                <td className="px-3 py-3 text-right text-emerald-300">{formatMoney(row.income)}</td>
                <td className="px-3 py-3 text-right text-rose-300">{formatMoney(row.expense)}</td>
                <td className="px-3 py-3 text-right text-sky-300">{formatMoney(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
