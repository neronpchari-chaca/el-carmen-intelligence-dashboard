export type IngestionValidationCheck = {
  label: string;
  status: 'ok' | 'warning';
  detail: string;
};

type IngestionValidationPanelProps = {
  checks: IngestionValidationCheck[];
  currentStage: string;
};

export function IngestionValidationPanel({ checks, currentStage }: IngestionValidationPanelProps) {
  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Control antes de publicar</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Validaciones</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className={`rounded-xl border p-3 text-sm ${check.status === 'ok' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-200'}`}>
            <p className="font-medium">{check.label}</p>
            <p className="mt-1 text-xs opacity-80">{check.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-zinc-400">Estado actual: {currentStage}</p>
    </article>
  );
}
