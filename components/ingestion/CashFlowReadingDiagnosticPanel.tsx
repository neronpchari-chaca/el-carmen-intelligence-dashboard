import type { GenericCashFlowNormalizeResult } from '@/lib/parsers/genericWideCashFlow';
import { buildCashFlowReadingIntelligence } from '@/lib/ingestion/cashFlowReadingIntelligence';

type CashFlowReadingDiagnosticPanelProps = {
  result: GenericCashFlowNormalizeResult;
};

const confidenceStyles = {
  alta: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  media: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  baja: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

const decisionStyles = {
  Publicable: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  'Revisar antes de publicar': 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  'No publicar': 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

export function CashFlowReadingDiagnosticPanel({ result }: CashFlowReadingDiagnosticPanelProps) {
  const diagnostic = result.readingDiagnostic;
  const intelligence = buildCashFlowReadingIntelligence(result);

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

      <section className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/75">IA de lectura</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{intelligence.format}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{intelligence.summary}</p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${decisionStyles[intelligence.decision]}`}>
            {intelligence.decision}
          </span>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Recomendacion</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{intelligence.recommendation}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Proximas acciones</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {intelligence.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Evidencia usada</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {intelligence.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

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
