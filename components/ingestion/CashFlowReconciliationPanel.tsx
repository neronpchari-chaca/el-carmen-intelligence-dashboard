import type { GenericCashFlowNormalizeResult } from '@/lib/parsers/genericWideCashFlow';

type CashFlowReconciliationPanelProps = {
  result: GenericCashFlowNormalizeResult;
};

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (value: number | null) => (value == null ? 'No detectado' : moneyFormatter.format(value));

export function CashFlowReconciliationPanel({ result }: CashFlowReconciliationPanelProps) {
  const warnings = result.reconciliation.filter((row) => row.status === 'warning');
  const missingBalances = result.reconciliation.filter((row) => row.status === 'missing-balance');
  const okCount = result.reconciliation.filter((row) => row.status === 'ok').length;

  if (result.reconciliation.length === 0) return null;

  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Asistente de cierre</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Control cruzado contra saldos</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Verifica: saldo anterior + entradas - salidas = saldo final.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${warnings.length ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
          {okCount}/{result.reconciliation.length} meses conciliados
        </span>
      </div>

      {warnings.length ? (
        <section className="mt-4 space-y-3">
          {warnings.map((row) => (
            <div key={row.period} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold">{row.period} no cierra por {formatMoney(row.difference)}</p>
                  <p className="mt-1 text-xs text-amber-100/80">
                    Saldo anterior {formatMoney(row.openingBalance)} + neto {formatMoney(row.net)} = esperado {formatMoney(row.expectedClosingBalance)}; saldo final informado {formatMoney(row.closingBalance)}.
                  </p>
                </div>
                <span className="rounded-full border border-amber-400/30 px-2.5 py-1 text-xs">Revisar</span>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <button className="rounded-xl border border-zinc-700 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-200">Buscar movimiento faltante</button>
                <button className="rounded-xl border border-zinc-700 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-200">Reclasificar fila</button>
                <button className="rounded-xl border border-zinc-700 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-200">Crear ajuste controlado</button>
                <button className="rounded-xl border border-zinc-700 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-200">Subir archivo corregido</button>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Todos los meses con saldos detectados cierran dentro de la tolerancia.
        </div>
      )}

      {missingBalances.length ? (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/45 p-4 text-sm text-zinc-300">
          {missingBalances.length} mes(es) no tienen saldo anterior o saldo final suficiente para conciliacion completa. Se puede revisar, pero no se usa como control fuerte.
        </div>
      ) : null}
    </article>
  );
}
