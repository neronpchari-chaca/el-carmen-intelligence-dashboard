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

const validationChecks = [
  { label: 'Fechas validas', status: 'ok' },
  { label: 'Importes numericos', status: 'ok' },
  { label: 'Moneda informada', status: 'warning' },
  { label: 'Categorias reconocidas', status: 'warning' },
  { label: 'Totales comparables contra archivo original', status: 'ok' },
];

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

  const allMappingsApproved = approvedCount === profile.mappings.length;

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
                    {check.label}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-400">Estado actual: {ingestionStages[stage]}</p>
            </article>
          </section>
        </section>
      </section>
    </main>
  );
}
