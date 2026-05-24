'use client';

import type { PublicationGateCheck, PublicationGateResult } from '@/lib/ingestion/publicationGate';

type PublicationGatePanelProps = {
  gate: PublicationGateResult;
};

const statusStyles: Record<PublicationGateCheck['status'], string> = {
  ok: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  pending: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  blocked: 'border-rose-500/25 bg-rose-500/10 text-rose-200',
};

const statusLabels: Record<PublicationGateCheck['status'], string> = {
  ok: 'OK',
  pending: 'Pendiente',
  blocked: 'Bloqueado',
};

export function PublicationGatePanel({ gate }: PublicationGatePanelProps) {
  return (
    <article className="glass rounded-2xl p-5 shadow-premium">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Antes de publicar</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Pendientes de control</h2>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs ${
            gate.status === 'ready'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          {gate.title}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {gate.checks.map((check) => (
          <div key={check.label} className={`rounded-xl border p-3 text-sm ${statusStyles[check.status]}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{check.label}</p>
              <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[11px]">
                {statusLabels[check.status]}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-80">{check.detail}</p>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 rounded-xl border p-3 text-sm ${
          gate.status === 'ready'
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
            : 'border-amber-500/25 bg-amber-500/10 text-amber-200'
        }`}
      >
        {gate.nextAction}
      </div>
    </article>
  );
}
