'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Bot, CheckCircle2, FileSpreadsheet, ShieldCheck, Upload, Wand2 } from 'lucide-react';
import { exampleCashFlowIngestionProfiles, ingestionStages, standardDatasetSchemas, type IngestionStage } from '@/config/dataIngestion';

const stageOrder: IngestionStage[] = [
  'received',
  'ai-mapping-suggested',
  'mapped',
  'validation-errors',
  'pending-approval',
  'approved',
  'published',
];

const stageLabels: Record<IngestionStage, string> = {
  received: 'Archivo recibido',
  'ai-mapping-suggested': 'Mapeo IA',
  mapped: 'Mapeo aprobado',
  'validation-errors': 'Validaciones',
  'pending-approval': 'Aprobacion',
  approved: 'Aprobado',
  published: 'Publicado',
};

const normalizedRows = [
  { date: '2026-05-02', account: 'Banco 1', category: 'Cobranza', concept: 'Cobranza cliente X', income: 100000, expense: 0, currency: 'ARS' },
  { date: '2026-05-06', account: 'Banco 1', category: 'Sueldos', concept: 'Pago sueldos planta', income: 0, expense: 52000, currency: 'ARS' },
  { date: '2026-05-09', account: 'Banco 2', category: 'Proveedor', concept: 'Pago insumos', income: 0, expense: 38000, currency: 'ARS' },
  { date: '2026-05-14', account: 'Banco 1', category: 'Cobranza', concept: 'Cobranza distribuidor', income: 64000, expense: 0, currency: 'ARS' },
];

const validationChecks = [
  { label: 'Fechas validas', status: 'ok', detail: '4 de 4 registros con fecha valida.' },
  { label: 'Importes numericos', status: 'ok', detail: 'Ingresos y egresos reconocidos correctamente.' },
  { label: 'Moneda informada', status: 'warning', detail: 'El archivo no trae moneda; se aplica ARS por perfil del cliente.' },
  { label: 'Categorias reconocidas', status: 'warning', detail: '1 categoria requiere confirmacion: Proveedor.' },
  { label: 'Totales comparables contra archivo original', status: 'ok', detail: 'Diferencia total: 0.' },
];

const sourceTotals = { income: 164000, expense: 90000 };

export default function DataIngestionPage() {
  const [stage, setStage] = useState<IngestionStage>('received');
  const [fileName, setFileName] = useState('cash_flow_cliente_demo_mayo.xlsx');
  const [approvedMappings, setApprovedMappings] = useState<Record<string, boolean>>({});

  const schema = standardDatasetSchemas.find((item) => item.id === 'cash-flow') ?? standardDatasetSchemas[0];
  const profile = exampleCashFlowIngestionProfiles.find((item) => item.id === 'cliente-demo-cashflow-bancos') ?? exampleCashFlowIngestionProfiles[0];

  const progressIndex = stageOrder.indexOf(stage);
  const approvedCount = useMemo(
    () => profile.mappings.filter((mapping) => approvedMappings[mapping.clientColumn] || mapping.approved).length,
    [approvedMappings, profile.mappings],
  );

  const normalizedTotals = useMemo(
    () => normalizedRows.reduce(
      (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense }),
      { income: 0, expense: 0 },
    ),
    [],
  );

  const netAmount = normalizedTotals.income - normalizedTotals.expense;
  const allMappingsApproved = approvedCount === profile.mappings.length;
  const showPreview = stage !== 'received' && stage !== 'ai-mapping-suggested';

  const simulateAiMapping = () => setStage('ai-mapping-suggested');
  const approveAllMappings = () => {
    setApprovedMappings(Object.fromEntries(profile.mappings.map((mapping) => [mapping.clientColumn, true])));
    setStage('mapped');
  };
  const runValidation = () => setStage('pending-approval');
  const approveLoad = () => setStage('approved');
  const publishLoad = () => setStage('published');

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050807] via-[#08110D] to-[#030404] px-5 py-6 text-zinc-100 md:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="glass rounded-2xl p-5 shadow-premium">
          <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200">
            <ArrowLeft size={16} /> Volver al dashboard
          </Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">DATOS · Ingesta inteligente</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Flujo de carga, normalizacion y aprobacion</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
                Maqueta del proceso para recibir archivos distintos por cliente, sugerir mapeos con IA, validar datos y publicar solo informacion aprobada.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Dataset estandar: {schema.name}
            </div>
          </div>
        </header>

        <section className="glass rounded-2xl p-4 shadow-premium">
          <div className="grid gap-3 md:grid-cols-7">
            {stageOrder.map((item, index) => {
              const active = index <= progressIndex;
              return (
                <div key={item} className={`rounded-xl border px-3 py-3 ${active ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200' : 'border-zinc-800 bg-zinc-900/35 text-zinc-500'}`}>
                  <p className="text-xs font-semibold">{index + 1}. {stageLabels[item]}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="glass rounded-2xl p-5 shadow-premium">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-3 text-sky-300"><FileSpreadsheet size={22} /></div>
              <div>
                <h2 className="text-xl font-semibold text-white">Archivo recibido</h2>
                <p className="mt-1 text-sm text-zinc-400">El archivo todavia no impacta dashboards ni indicadores.</p>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/45 px-4 py-8 text-center transition hover:border-emerald-500/50">
              <Upload size={26} className="text-emerald-300" />
              <span className="mt-3 text-sm font-medium text-zinc-200">Seleccionar archivo de cliente</span>
              <span className="mt-1 text-xs text-zinc-500">XLSX o CSV · flujo simulado</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? fileName);
                  setStage('received');
                  setApprovedMappings({});
                }}
              />
            </label>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/45 p-4 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Archivo actual</p>
              <p className="mt-1 font-medium text-zinc-100">{fileName}</p>
              <p className="mt-2 text-xs text-zinc-500">Perfil: {profile.sourceName}</p>
            </div>

            <div className="mt-4 grid gap-2">
              <button onClick={simulateAiMapping} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400">
                <Wand2 size={16} /> Sugerir mapeo con IA
              </button>
              <button onClick={runValidation} disabled={!allMappingsApproved} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40">
                <ShieldCheck size={16} /> Validar datos
              </button>
              <button onClick={approveLoad} disabled={stage !== 'pending-approval'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40">
                <CheckCircle2 size={16} /> Aprobar carga
              </button>
              <button onClick={publishLoad} disabled={stage !== 'approved'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                Publicar en dashboard
              </button>
            </div>
          </article>

          <section className="space-y-6">
            <article className="glass rounded-2xl p-5 shadow-premium">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">IA asistente</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Mapeo sugerido</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200"><Bot size={14} /> Requiere aprobacion</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm text-zinc-300">
                  <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Columna cliente</th>
                      <th className="px-3 py-2 text-left">Campo estandar</th>
                      <th className="px-3 py-2 text-left">Confianza</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.mappings.map((mapping) => {
                      const approved = approvedMappings[mapping.clientColumn] || mapping.approved;
                      return (
                        <tr key={mapping.clientColumn} className="border-t border-zinc-800">
                          <td className="px-3 py-3">{mapping.clientColumn}</td>
                          <td className="px-3 py-3 text-emerald-200">{mapping.standardField}</td>
                          <td className="px-3 py-3">{Math.round(mapping.confidence * 100)}%</td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => setApprovedMappings((prev) => ({ ...prev, [mapping.clientColumn]: true }))}
                              className={`rounded-full border px-2 py-1 text-xs ${approved ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}
                            >
                              {approved ? 'Aprobado' : 'Aprobar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button onClick={approveAllMappings} className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                Aprobar todos los mapeos
              </button>
            </article>

            <article className="glass rounded-2xl p-5 shadow-premium">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Control antes de publicar</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Validaciones</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {validationChecks.map((check) => (
                  <div key={check.label} className={`rounded-xl border p-3 text-sm ${check.status === 'ok' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-200'}`}>
                    <p className="font-medium">{check.label}</p>
                    <p className="mt-1 text-xs opacity-80">{check.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-400">Estado actual: {ingestionStages[stage]}</p>
            </article>
          </section>
        </section>

        {showPreview ? (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="glass rounded-2xl p-5 shadow-premium">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Preview normalizado</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Datos que entrarian al modelo estandar</h2>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  {normalizedRows.length} registros detectados
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm text-zinc-300">
                  <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Cuenta</th>
                      <th className="px-3 py-2 text-left">Categoria</th>
                      <th className="px-3 py-2 text-left">Concepto</th>
                      <th className="px-3 py-2 text-right">Ingreso</th>
                      <th className="px-3 py-2 text-right">Egreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedRows.map((row) => (
                      <tr key={`${row.date}-${row.concept}`} className="border-t border-zinc-800">
                        <td className="px-3 py-3">{row.date}</td>
                        <td className="px-3 py-3">{row.account}</td>
                        <td className="px-3 py-3 text-emerald-200">{row.category}</td>
                        <td className="px-3 py-3">{row.concept}</td>
                        <td className="px-3 py-3 text-right text-emerald-300">{row.income.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-3 text-right text-rose-300">{row.expense.toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <section className="space-y-6">
              <article className="glass rounded-2xl p-5 shadow-premium">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Conciliacion</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Totales de control</h2>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Ingresos archivo / normalizado</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">{sourceTotals.income.toLocaleString('es-AR')} / {normalizedTotals.income.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Egresos archivo / normalizado</p>
                    <p className="mt-1 text-sm font-semibold text-rose-300">{sourceTotals.expense.toLocaleString('es-AR')} / {normalizedTotals.expense.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Neto a publicar</p>
                    <p className="mt-1 text-lg font-semibold text-sky-300">{netAmount.toLocaleString('es-AR')} ARS</p>
                  </div>
                </div>
              </article>

              <article className="glass rounded-2xl p-5 shadow-premium">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Impacto si se publica</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Resumen ejecutivo</h2>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  <li className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">Se actualizaria Cash Flow Mayo 2026.</li>
                  <li className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">El neto mensual subiria {netAmount.toLocaleString('es-AR')} ARS.</li>
                  <li className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-200">Queda pendiente confirmar categoria Proveedor.</li>
                </ul>
              </article>
            </section>
          </section>
        ) : null}
      </section>
    </main>
  );
}
