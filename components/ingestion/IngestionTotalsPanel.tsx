type IngestionTotalsPanelProps = {
  totals: {
    income: number;
    expense: number;
    net: number;
  };
};

const formatMoney = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function IngestionTotalsPanel({ totals }: IngestionTotalsPanelProps) {
  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Resumen</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Totales detectados</h2>
      <div className="mt-4 grid gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Ingresos</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300">{formatMoney(totals.income)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Egresos</p>
          <p className="mt-1 text-sm font-semibold text-rose-300">{formatMoney(totals.expense)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Neto</p>
          <p className="mt-1 text-lg font-semibold text-sky-300">{formatMoney(totals.net)}</p>
        </div>
      </div>
    </article>
  );
}
