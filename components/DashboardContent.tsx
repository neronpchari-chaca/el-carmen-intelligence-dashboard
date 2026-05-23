'use client';

import { useMemo, useState, type ReactNode } from 'react';
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
import { AlertCircle, CheckCircle2, CircleDashed, Clock3, Database, Upload } from 'lucide-react';
import {
  compareMetrics,
  countryKpis,
  dataCenterDatasets,
  governanceDatasets,
  governanceFutureDatasets,
  governanceNamingRules,
  governanceOfficialKpis,
  governanceRoadmap,
  kpisConsolidated,
  placeholdersByModule,
  projectedGrowth,
  royaltiesEvolution,
  surfaceComparison,
  type CountryCode,
  type DataCenterDataset,
  type DataCenterDatasetStatus,
} from '@/data/mockData';

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

const statusUi: Record<DataCenterDatasetStatus, { label: string; badge: string; icon: ReactNode }> = {
  ok: {
    label: 'OK',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: <CheckCircle2 size={15} />,
  },
  incomplete: {
    label: 'Incompleto',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    icon: <CircleDashed size={15} />,
  },
  error: {
    label: 'Error',
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    icon: <AlertCircle size={15} />,
  },
};

function DataCenterModule() {
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [datasetById, setDatasetById] = useState<Record<string, DataCenterDataset>>(() =>
    Object.fromEntries(dataCenterDatasets.map((dataset) => [dataset.id, dataset])),
  );

  const datasets = useMemo(() => Object.values(datasetById), [datasetById]);

  const onUpload = (datasetId: string, fileName?: string) => {
    setLoadingById((prev) => ({ ...prev, [datasetId]: true }));

    window.setTimeout(() => {
      setDatasetById((prev) => {
        const current = prev[datasetId];
        if (!current) return prev;

        const lowerName = (fileName ?? '').toLowerCase();
        let status: DataCenterDatasetStatus = 'ok';
        let validationMessage = 'Validación completada correctamente.';

        if (lowerName.includes('fecha')) {
          status = 'error';
          validationMessage = 'Formato de fecha inválido o falta columna Fecha';
        } else if (lowerName.includes('moneda')) {
          status = 'error';
          validationMessage = 'Moneda inválida. Permitidas: BRL, ARS, USD';
        } else if (datasetId === 'tipos-cambio' && lowerName.includes('faltatc')) {
          status = 'error';
          validationMessage = 'Falta tipo de cambio para el mes';
        } else if (lowerName.includes('vacio')) {
          status = 'incomplete';
          validationMessage = 'Campo obligatorio vacío';
        } else if (datasetId === 'cashflow-operativo') {
          status = 'ok';
          validationMessage = 'Carga válida. Consolidación USD aplicada usando dataset Tipos de Cambio.';
        }

        return {
          ...prev,
          [datasetId]: {
            ...current,
            status,
            validationMessage,
            lastUpdated: new Date().toLocaleString('es-AR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        };
      });

      setLoadingById((prev) => ({ ...prev, [datasetId]: false }));
    }, 1150);
  };

  return (
    <section className="space-y-6">
      <article className="glass rounded-2xl p-5 shadow-premium">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">DATOS · Centro de Datos</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Gestión simple de datasets para dashboards y KPIs</h2>
        <p className="mt-2 max-w-4xl text-sm text-zinc-400">
          Descargá plantillas Excel, completalas y volvé a subirlas. Este módulo está preparado para conectar en el futuro integraciones con Excel, base de datos, IA analítica y generación automática de dashboards sin alterar la arquitectura actual.
        </p>
      </article>

      <section className="grid gap-4 xl:grid-cols-2">
        {datasets.map((dataset, index) => {
          const currentStatus = statusUi[dataset.status];
          const loading = loadingById[dataset.id] ?? false;

          return (
            <motion.article
              key={dataset.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className="glass rounded-2xl border border-zinc-800/80 p-5 shadow-premium"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">{dataset.name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{dataset.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${currentStatus.badge}`}>
                  {currentStatus.icon}
                  {currentStatus.label}
                </span>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/35 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Campos obligatorios</p>
                <div className="flex flex-wrap gap-2">
                  {dataset.requiredFields.map((field) => (
                    <span key={field} className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-xs text-zinc-300">
                      {field}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock3 size={14} /> Última actualización: {dataset.lastUpdated}
                </div>
                <div className="text-xs text-zinc-400">
                  Estado de validación:{' '}
                  <span className={dataset.status === 'ok' ? 'text-emerald-300' : dataset.status === 'error' ? 'text-rose-300' : 'text-amber-300'}>
                    {dataset.validationMessage}
                  </span>
                </div>
                {dataset.supportsProjectedMonths ? (
                  <div className="text-xs text-zinc-400">Admite carga proyectada de hasta {dataset.supportsProjectedMonths} meses.</div>
                ) : null}
                {dataset.conversionConfig?.enabled ? (
                  <div className="text-xs text-zinc-400">
                    Conversión a USD preparada (manual hoy; lista para regla/API futura).
                  </div>
                ) : null}
                {dataset.dashboardMetrics ? (
                  <div className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300 md:grid-cols-2">
                    <div>
                      <p className="text-zinc-500">Total ingresos</p>
                      <p className="text-sm font-semibold text-emerald-300">{dataset.dashboardMetrics.totalIngresos.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Total egresos</p>
                      <p className="text-sm font-semibold text-rose-300">{dataset.dashboardMetrics.totalEgresos.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Neto mensual</p>
                      <p className="text-sm font-semibold text-sky-300">{dataset.dashboardMetrics.resultadoNeto.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Caja acumulada</p>
                      <p className="text-sm font-semibold text-cyan-300">{dataset.dashboardMetrics.cajaAcumulada.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Resultado USD</p>
                      <p className="text-sm font-semibold text-violet-300">USD {dataset.dashboardMetrics.resultadoUsd.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="md:col-span-2 text-zinc-500">
                      Fuente FX: {dataset.dashboardMetrics.fxDataset} · Monedas: {dataset.dashboardMetrics.supportedCurrencies.join(', ')} · Arquitectura multi-país:{' '}
                      {dataset.dashboardMetrics.multiCountryReady ? 'lista' : 'pendiente'}
                    </div>
                  </div>
                ) : null}
              </div>

                {dataset.cashFlowMonthlyEvolution ? (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Evolución caja acumulada mensual</p>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataset.cashFlowMonthlyEvolution}>
                          <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" />
                          <XAxis dataKey="mes" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Line type="monotone" dataKey="saldoFinal" name="Caja acumulada BRL" stroke="#63B58E" strokeWidth={2.6} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20">
                  Descargar plantilla
                </button>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/70 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700/70">
                  <Upload size={14} /> Subir archivo
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(event) => onUpload(dataset.id, event.target.files?.[0]?.name)}
                  />
                </label>
              </div>

              <div className="mt-3 min-h-6 text-xs">
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-sky-300">
                    <Database size={14} className="animate-pulse" /> Cargando y validando archivo...
                  </span>
                ) : (
                  <span className={dataset.status === 'ok' ? 'text-emerald-300' : dataset.status === 'error' ? 'text-rose-300' : 'text-amber-300'}>
                    {dataset.validationMessage}
                  </span>
                )}
              </div>
            </motion.article>
          );
        })}
      </section>
    </section>
  );
}

function CountryDashboard({ country }: { country: CountryCode }) {
  const label = country === 'argentina' ? 'Argentina' : 'Brasil';
  return <div className="space-y-6">{/* omitted for brevity in generation */}
      {renderKpis(countryKpis[country])}
      <article className="glass h-80 rounded-2xl p-5 shadow-premium"><h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Evolución royalties — {label}</h3><ResponsiveContainer width="100%" height="88%"><LineChart data={royaltiesEvolution}><CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" /><XAxis dataKey="year" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey={country} stroke="#63B58E" strokeWidth={2.8} /></LineChart></ResponsiveContainer></article>
    </div>;
}

function CompareDashboard() { return (
<section className="grid gap-6 xl:grid-cols-2"><article className="glass h-96 rounded-2xl p-5 shadow-premium"><h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Comparativo AR-BR por métrica</h3><ResponsiveContainer width="100%" height="88%"><BarChart data={compareMetrics}><CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" /><XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-10} height={72} /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="argentina" fill="#63B58E" radius={[6, 6, 0, 0]} /><Bar dataKey="brasil" fill="#1E7C59" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></article><article className="glass rounded-2xl p-5 shadow-premium"><h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Diferencias estratégicas</h3><div className="space-y-3">{compareMetrics.map((metric) => (<div key={metric.metric} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"><p className="text-sm text-zinc-200">{metric.metric}</p><p className="mt-1 text-xs text-zinc-400">AR: {metric.argentina} {metric.unit} · BR: {metric.brasil} {metric.unit}</p></div>))}</div></article></section>
); }

function GlobalDashboard() { return (<div className="space-y-6">{renderKpis(kpisConsolidated)}<section className="grid gap-6 xl:grid-cols-2"><article className="glass h-80 rounded-2xl p-5 shadow-premium"><h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Royalties consolidados Argentina + Brasil (USD M)</h3><ResponsiveContainer width="100%" height="88%"><LineChart data={royaltiesEvolution}><CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" /><XAxis dataKey="year" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="argentina" stroke="#63B58E" strokeWidth={2.8} /><Line type="monotone" dataKey="brasil" stroke="#1E7C59" strokeWidth={2.8} /></LineChart></ResponsiveContainer></article><article className="glass h-80 rounded-2xl p-5 shadow-premium"><h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Superficie genética: Argentina vs Brasil (kha)</h3><ResponsiveContainer width="100%" height="88%"><BarChart data={surfaceComparison}><CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="argentina" fill="#63B58E" radius={[8, 8, 0, 0]} /><Bar dataKey="brasil" fill="#1E7C59" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></article></section><article className="glass h-80 rounded-2xl p-5 shadow-premium"><h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Crecimiento proyectado regional (%)</h3><ResponsiveContainer width="100%" height="88%"><AreaChart data={projectedGrowth}><CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" /><XAxis dataKey="quarter" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Area type="monotone" dataKey="conservative" stackId="1" stroke="#1F6148" fill="#1F6148" /><Area type="monotone" dataKey="target" stackId="2" stroke="#2B8D66" fill="#2B8D66" /><Area type="monotone" dataKey="upside" stackId="3" stroke="#63B58E" fill="#63B58E" /></AreaChart></ResponsiveContainer></article></div>); }

function DataGovernanceModule() {
  return (
    <section className="space-y-6">
      <article className="glass rounded-2xl p-5 shadow-premium">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">DATOS · Gobierno de Datos</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Arquitectura, metodología y control operativo de datasets</h2>
        <p className="mt-2 max-w-4xl text-sm text-zinc-400">
          Marco operativo para documentar datasets oficiales, responsabilidades, calidad de carga y lineamientos de evolución de la plataforma manteniendo el diseño enterprise actual.
        </p>
      </article>

      <article className="glass overflow-hidden rounded-2xl border border-zinc-800/80 shadow-premium">
        <div className="border-b border-zinc-800 bg-zinc-900/35 px-5 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Datasets registrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-zinc-300">
            <thead className="bg-zinc-900/50 text-xs uppercase tracking-[0.15em] text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left">Dataset</th><th className="px-4 py-3 text-left">Responsable</th><th className="px-4 py-3 text-left">Frecuencia</th><th className="px-4 py-3 text-left">Moneda base</th><th className="px-4 py-3 text-left">Versión</th><th className="px-4 py-3 text-left">Última carga</th><th className="px-4 py-3 text-left">Estado validación</th>
              </tr>
            </thead>
            <tbody>
              {governanceDatasets.map((row) => (
                <tr key={row.id} className="border-t border-zinc-800/80">
                  <td className="px-4 py-3">{row.dataset}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.responsable}</td>
                  <td className="px-4 py-3">{row.frecuenciaActualizacion}</td>
                  <td className="px-4 py-3">{row.monedaBase}</td>
                  <td className="px-4 py-3">{row.version}</td>
                  <td className="px-4 py-3">{row.fechaUltimaCarga}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-1 text-xs ${row.estadoValidacion === 'Validado' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : row.estadoValidacion === 'En revisión' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>{row.estadoValidacion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="glass rounded-2xl p-5 shadow-premium"><h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Roadmap plataforma</h3><ul className="mt-3 space-y-2 text-sm text-zinc-300">{governanceRoadmap.map((item) => <li key={item.hito} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3"><p className="text-xs uppercase tracking-[0.15em] text-zinc-500">{item.trimestre} · {item.estado}</p><p className="mt-1">{item.hito}</p></li>)}</ul></article>
        <article className="glass rounded-2xl p-5 shadow-premium"><h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Datasets futuros</h3><ul className="mt-3 space-y-2 text-sm text-zinc-300">{governanceFutureDatasets.map((item) => <li key={item} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">{item}</li>)}</ul></article>
        <article className="glass rounded-2xl p-5 shadow-premium"><h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">KPIs oficiales</h3><ul className="mt-3 space-y-2 text-sm text-zinc-300">{governanceOfficialKpis.map((item) => <li key={item} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">{item}</li>)}</ul></article>
        <article className="glass rounded-2xl p-5 shadow-premium"><h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Reglas de nomenclatura</h3><ul className="mt-3 space-y-2 text-sm text-zinc-300">{governanceNamingRules.map((item) => <li key={item} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">{item}</li>)}</ul></article>
      </section>
    </section>
  );
}

export function DashboardContent({ activeId }: { activeId: string }) {
  if (activeId === 'region-argentina') return <CountryDashboard country="argentina" />;
  if (activeId === 'region-brasil') return <CountryDashboard country="brasil" />;
  if (activeId === 'region-compare') return <CompareDashboard />;
  if (activeId === 'global-dashboard') return <GlobalDashboard />;
  if (activeId === 'data-center') return <DataCenterModule />;
  if (activeId === 'data-governance') return <DataGovernanceModule />;

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
