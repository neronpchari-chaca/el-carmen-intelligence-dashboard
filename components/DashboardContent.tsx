'use client';

import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compareMetrics, countryKpis, kpisConsolidated, placeholdersByModule, projectedGrowth, royaltiesEvolution, surfaceComparison, type CountryCode } from '@/data/mockData';

const renderKpis = (items: { label: string; value: string; delta: string }[]) => (
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map((kpi, index) => (
      <motion.article
        key={kpi.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="glass rounded-2xl p-4 shadow-premium"
      >
        <p className="text-xs uppercase tracking-wider text-zinc-400">{kpi.label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpi.value}</p>
        <p className="mt-1 text-sm text-emerald-300">{kpi.delta}</p>
      </motion.article>
    ))}
  </section>
);

function CountryDashboard({ country }: { country: CountryCode }) {
  const label = country === 'argentina' ? 'Argentina' : 'Brasil';
  return (
    <div className="space-y-6">
      {renderKpis(countryKpis[country])}
      <article className="glass h-80 rounded-2xl p-5 shadow-premium">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Evolución royalties — {label}</h3>
        <ResponsiveContainer width="100%" height="88%">
          <LineChart data={royaltiesEvolution}>
            <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey={country} stroke="#63B58E" strokeWidth={2.8} />
          </LineChart>
        </ResponsiveContainer>
      </article>
    </div>
  );
}

function CompareDashboard() {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <article className="glass h-96 rounded-2xl p-5 shadow-premium">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Comparativo AR-BR por métrica</h3>
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={compareMetrics}>
            <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
            <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-10} height={72} />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="argentina" fill="#63B58E" radius={[6, 6, 0, 0]} />
            <Bar dataKey="brasil" fill="#1E7C59" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="glass rounded-2xl p-5 shadow-premium">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Diferencias estratégicas</h3>
        <div className="space-y-3">
          {compareMetrics.map((metric) => (
            <div key={metric.metric} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-sm text-zinc-200">{metric.metric}</p>
              <p className="mt-1 text-xs text-zinc-400">
                AR: {metric.argentina} {metric.unit} · BR: {metric.brasil} {metric.unit}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function GlobalDashboard() {
  return (
    <div className="space-y-6">
      {renderKpis(kpisConsolidated)}
      <section className="grid gap-6 xl:grid-cols-2">
        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Royalties consolidados Argentina + Brasil (USD M)</h3>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={royaltiesEvolution}>
              <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="argentina" stroke="#63B58E" strokeWidth={2.8} />
              <Line type="monotone" dataKey="brasil" stroke="#1E7C59" strokeWidth={2.8} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Superficie genética: Argentina vs Brasil (kha)</h3>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={surfaceComparison}>
              <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="argentina" fill="#63B58E" radius={[8, 8, 0, 0]} />
              <Bar dataKey="brasil" fill="#1E7C59" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
      <article className="glass h-80 rounded-2xl p-5 shadow-premium">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Crecimiento proyectado regional (%)</h3>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={projectedGrowth}>
            <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
            <XAxis dataKey="quarter" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Area type="monotone" dataKey="conservative" stackId="1" stroke="#1F6148" fill="#1F6148" />
            <Area type="monotone" dataKey="target" stackId="2" stroke="#2B8D66" fill="#2B8D66" />
            <Area type="monotone" dataKey="upside" stackId="3" stroke="#63B58E" fill="#63B58E" />
          </AreaChart>
        </ResponsiveContainer>
      </article>
    </div>
  );
}

export function DashboardContent({ activeId }: { activeId: string }) {
  if (activeId === 'region-argentina') return <CountryDashboard country="argentina" />;
  if (activeId === 'region-brasil') return <CountryDashboard country="brasil" />;
  if (activeId === 'region-compare') return <CompareDashboard />;
  if (activeId === 'global-dashboard') return <GlobalDashboard />;

  return (
    <section className="space-y-4">
      {placeholdersByModule.default.map((block) => (
        <article key={block.title} className="glass rounded-2xl p-5 shadow-premium">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Módulo en implementación</p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-100">{block.title}</h3>
          <p className="mt-2 text-sm text-zinc-400">{block.description}</p>
        </article>
      ))}
    </section>
  );
}
