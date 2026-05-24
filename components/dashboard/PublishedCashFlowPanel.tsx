'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileSpreadsheet, WalletCards } from 'lucide-react';
import { loadPublishedCashFlow, type PublishedCashFlowSnapshot } from '@/lib/ingestion/publishedCashFlowStore';

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatMoney = (value: number) => moneyFormatter.format(value);

function buildExecutiveSignals(snapshot: PublishedCashFlowSnapshot) {
  let accumulated = 0;
  const evolution = snapshot.monthlySummary.map((row) => {
    accumulated += row.net;
    return { period: row.period, net: row.net, expense: row.expense, cash: Math.round(accumulated * 100) / 100 };
  });

  const worst = evolution.reduce((current, row) => (row.cash < current.cash ? row : current), evolution[0]);
  const last = evolution.at(-1);
  const critical = evolution.find((row) => row.cash < 0);

  return { worst, last, critical };
}

export function PublishedCashFlowPanel() {
  const [snapshot, setSnapshot] = useState<PublishedCashFlowSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(loadPublishedCashFlow());
  }, []);

  const signals = useMemo(() => (snapshot ? buildExecutiveSignals(snapshot) : null), [snapshot]);

  if (!snapshot || !signals) {
    return (
      <article className="glass rounded-2xl border border-zinc-800/80 p-5 shadow-premium">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-3 text-zinc-300">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Foco cash flow</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-100">Sin cash flow publicado</h2>
            <p className="mt-2 text-sm text-zinc-400">Publica una carga para mostrar alertas ejecutivas en el dashboard global.</p>
          </div>
        </div>
      </article>
    );
  }

  const cards = [
    {
      label: 'Caja acumulada cargada',
      value: formatMoney(signals.last?.cash ?? 0),
      detail: signals.last ? `Ultimo periodo: ${signals.last.period}` : 'Sin periodo',
      tone: (signals.last?.cash ?? 0) < 0 ? 'text-rose-300' : 'text-emerald-300',
    },
    {
      label: 'Maxima exposicion',
      value: formatMoney(signals.worst?.cash ?? 0),
      detail: signals.worst ? `Mes de mayor riesgo: ${signals.worst.period}` : 'Sin periodo',
      tone: (signals.worst?.cash ?? 0) < 0 ? 'text-rose-300' : 'text-amber-300',
    },
    {
      label: 'Alerta principal',
      value: signals.critical ? 'Caja negativa' : 'Sin alerta critica',
      detail: signals.critical ? `Primer mes critico: ${signals.critical.period}` : 'El cash flow publicado no marca caja negativa.',
      tone: signals.critical ? 'text-rose-300' : 'text-emerald-300',
    },
  ];

  return (
    <article className="glass rounded-2xl border border-emerald-500/20 p-5 shadow-premium">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-emerald-300">
            <WalletCards size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Foco cash flow</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-100">Senales ejecutivas publicadas</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {snapshot.sourceFile} · {snapshot.monthRange} · {dateFormatter.format(new Date(snapshot.publishedAt))}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
          <AlertTriangle size={13} /> Ver analisis completo en Finanzas &gt; Cash Flow
        </span>
      </div>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">{card.label}</p>
            <p className={`mt-2 text-xl font-semibold ${card.tone}`}>{card.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{card.detail}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
