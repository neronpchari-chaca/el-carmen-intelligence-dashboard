'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, FileSpreadsheet } from 'lucide-react';
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

export function PublishedCashFlowPanel() {
  const [snapshot, setSnapshot] = useState<PublishedCashFlowSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(loadPublishedCashFlow());
  }, []);

  const chartData = useMemo(
    () =>
      snapshot?.monthlySummary.map((row) => ({
        periodo: row.period,
        Ingresos: row.income,
        Egresos: row.expense,
        Neto: row.net,
      })) ?? [],
    [snapshot],
  );

  if (!snapshot) {
    return (
      <article className="glass rounded-2xl border border-zinc-800/80 p-5 shadow-premium">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-3 text-zinc-300">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Cash flow cargado</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-100">Todavia no hay una carga publicada</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Subi un Excel desde Carga de cash flow, revisalo y publicalo para verlo resumido aca.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <section className="space-y-6">
      <article className="glass rounded-2xl border border-emerald-500/20 p-5 shadow-premium">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Cash flow publicado</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-100">Resumen cargado desde Excel</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Archivo: <span className="text-zinc-200">{snapshot.sourceFile}</span> · Periodo: {snapshot.monthRange} · Publicado: {dateFormatter.format(new Date(snapshot.publishedAt))}
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {snapshot.recordCount} movimientos
          </span>
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Ingresos</p>
            <p className="mt-2 text-xl font-semibold text-emerald-300">{formatMoney(snapshot.totals.income)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Egresos</p>
            <p className="mt-2 text-xl font-semibold text-rose-300">{formatMoney(snapshot.totals.expense)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Neto</p>
            <p className={`mt-2 text-xl font-semibold ${snapshot.totals.net >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {formatMoney(snapshot.totals.net)}
            </p>
          </div>
        </section>
      </article>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Evolucion mensual</h3>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
              <XAxis dataKey="periodo" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="Ingresos" fill="#63B58E" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Egresos" fill="#E97373" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="glass overflow-hidden rounded-2xl border border-zinc-800/80 shadow-premium">
          <div className="border-b border-zinc-800 bg-zinc-900/35 px-5 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Resumen por mes</h3>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full text-sm text-zinc-300">
              <thead className="bg-zinc-900/50 text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Mes</th>
                  <th className="px-4 py-3 text-right">Ingresos</th>
                  <th className="px-4 py-3 text-right">Egresos</th>
                  <th className="px-4 py-3 text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.monthlySummary.map((row) => (
                  <tr key={row.period} className="border-t border-zinc-800/80">
                    <td className="px-4 py-3 font-medium text-zinc-100">{row.period}</td>
                    <td className="px-4 py-3 text-right text-emerald-300">{formatMoney(row.income)}</td>
                    <td className="px-4 py-3 text-right text-rose-300">{formatMoney(row.expense)}</td>
                    <td className={`px-4 py-3 text-right ${row.net >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>{formatMoney(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>
  );
}
