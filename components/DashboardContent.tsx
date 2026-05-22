'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area,
} from 'recharts';
import { incomeDistribution, kpis, pipelineVarietal, projectedGrowth, royaltiesEvolution, surfaceComparison } from '@/data/mockData';

const colors = ['#145A43', '#1E7C59', '#63B58E', '#95D0B1'];

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.article
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="glass rounded-2xl p-4 shadow-premium"
          >
            <p className="text-xs uppercase tracking-wider text-zinc-400">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{kpi.value}</p>
            <p className="mt-1 text-sm text-emerald-300">{kpi.delta}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Evolución royalties (USD M)</h3>
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

        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Pipeline varietal (n° materiales)</h3>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={pipelineVarietal} layout="vertical">
              <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="stage" stroke="#94a3b8" width={110} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {pipelineVarietal.map((entry, i) => (
                  <Cell key={entry.stage} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Distribución de ingresos 2026</h3>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie data={incomeDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={100} paddingAngle={3}>
                {incomeDistribution.map((entry, idx) => (
                  <Cell key={entry.name} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <article className="glass h-80 rounded-2xl p-5 shadow-premium">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Crecimiento proyectado (%)</h3>
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {['Carga futura de Excel', 'Repositorio de PDFs', 'IA analítica ejecutiva', 'Autenticación multiusuario'].map((item) => (
          <div key={item} className="glass rounded-2xl p-4 shadow-premium">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Arquitectura preparada</p>
            <p className="mt-2 text-base font-medium text-zinc-100">{item}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
