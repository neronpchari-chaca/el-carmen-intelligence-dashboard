import type { GenericCashFlowIssue } from '@/lib/parsers/genericWideCashFlow';

type IngestionIssuesPanelProps = {
  issues: GenericCashFlowIssue[];
};

export function IngestionIssuesPanel({ issues }: IngestionIssuesPanelProps) {
  if (issues.length === 0) return null;

  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Para resolver</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Observaciones detectadas</h2>
      <div className="mt-4 grid gap-2">
        {issues.map((issue) => (
          <div key={`${issue.group}-${issue.title}`} className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-100">
            <p className="font-medium">{issue.title} ({issue.count})</p>
            <p className="mt-1 text-xs opacity-80">{issue.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
