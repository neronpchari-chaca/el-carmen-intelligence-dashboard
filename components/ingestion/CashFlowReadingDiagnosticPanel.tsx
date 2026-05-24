import type { GenericCashFlowNormalizeResult } from '@/lib/parsers/genericWideCashFlow';

type CashFlowReadingDiagnosticPanelProps = {
  result: GenericCashFlowNormalizeResult;
};

const confidenceStyles = {
  alta: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  media: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  baja: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

export function CashFlowReadingDiagnosticPanel({ result }: CashFlowReadingDiagnosticPanelProps) {
  const diagnostic = result.readingDiagnostic;

  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Diagnostico de lectura</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Como se interpreto el archivo</h2>
          <p className="mt-2 text-sm text-zinc-400">Hoja elegida: <span className="text-zinc-100">{result.sourceSheet}</span></p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${confidenceStyles[diagnostic.confidence]}`}>
          Confianza {diagnostic.confidence} · {diagnostic.confidenceScore}/100
        </span>
      </div>

      <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Fila de meses</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{diagnostic.detectedRows.headerRow || 'No detectada'}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Entradas</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{diagnostic.detectedRows.entradaRow ?? 'No detectada'}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Salidas</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{diagnostic.detectedRows.salidaRow ?? 'No detectada'}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
          <p className="text-xs text-zinc-500">Saldo final</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{diagnostic.detectedRows.saldoFinalRow ?? 'No detectado'}</p>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Por que confia o no confia</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {diagnostic.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Filas excluidas</p>
          <p className="mt-2 text-sm text-zinc-300">{diagnostic.detectedRows.excludedRows} fila(s) quedaron fuera de movimientos.</p>
          <div className="mt-3 space-y-2 text-xs text-zinc-400">
            {diagnostic.excludedSamples.map((item) => (
              <div key={`${item.row}-${item.concept}`} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-2">
                Fila {item.row}: {item.concept} · {item.reason}
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
