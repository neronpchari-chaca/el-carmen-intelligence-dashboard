'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, ShieldCheck, Upload, Wand2 } from 'lucide-react';
import { ingestionStages, standardDatasetSchemas, type IngestionStage } from '@/config/dataIngestion';
import { IngestionIssuesPanel } from '@/components/ingestion/IngestionIssuesPanel';
import { IngestionTotalsPanel } from '@/components/ingestion/IngestionTotalsPanel';
import { IngestionValidationPanel, type IngestionValidationCheck } from '@/components/ingestion/IngestionValidationPanel';
import { NormalizedPreviewTable } from '@/components/ingestion/NormalizedPreviewTable';
import { detectCashFlowFile } from '@/lib/ingestion/detectCashFlowWorkbook';
import { savePublishedCashFlow } from '@/lib/ingestion/publishedCashFlowStore';
import type { GenericCashFlowNormalizeResult, GenericCashFlowRecord } from '@/lib/parsers/genericWideCashFlow';

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
  'ai-mapping-suggested': 'Lectura sugerida',
  mapped: 'Lectura aprobada',
  'validation-errors': 'Validaciones',
  'pending-approval': 'Aprobacion',
  approved: 'Aprobado',
  published: 'Publicado',
};

const demoRows: GenericCashFlowRecord[] = [
  { period: 'may-26', concept: 'Cobranza cliente X', type: 'Entrada', income: 100000, expense: 0, net: 100000, sourceSheet: 'Demo', sourceRow: 0 },
  { period: 'may-26', concept: 'Pago sueldos planta', type: 'Salida', income: 0, expense: 52000, net: -52000, sourceSheet: 'Demo', sourceRow: 0 },
  { period: 'may-26', concept: 'Pago insumos', type: 'Salida', income: 0, expense: 38000, net: -38000, sourceSheet: 'Demo', sourceRow: 0 },
  { period: 'may-26', concept: 'Cobranza distribuidor', type: 'Entrada', income: 64000, expense: 0, net: 64000, sourceSheet: 'Demo', sourceRow: 0 },
];

type FileDiagnostic = {
  status: 'ok' | 'warning';
  title: string;
  detail: string;
  records: number;
  monthRange: string;
};

export default function DataIngestionPage() {
  const [stage, setStage] = useState<IngestionStage>('received');
  const [fileName, setFileName] = useState('cash_flow_cliente_demo_mayo.xlsx');
  const [approvedReading, setApprovedReading] = useState(false);
  const [parseResult, setParseResult] = useState<GenericCashFlowNormalizeResult | null>(null);
  const [fileDiagnostic, setFileDiagnostic] = useState<FileDiagnostic | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [publishedMessage, setPublishedMessage] = useState<string | null>(null);

  const schema = standardDatasetSchemas.find((item) => item.id === 'cash-flow') ?? standardDatasetSchemas[0];
  const progressIndex = stageOrder.indexOf(stage);
  const displayRows = parseResult ? parseResult.records.slice(0, 12) : demoRows;

  const normalizedTotals = useMemo(() => {
    if (parseResult) {
      return parseResult.monthlySummary.reduce(
        (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense, net: totals.net + row.net }),
        { income: 0, expense: 0, net: 0 },
      );
    }

    return demoRows.reduce(
      (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense, net: totals.net + row.net }),
      { income: 0, expense: 0, net: 0 },
    );
  }, [parseResult]);

  const issues = parseResult?.issues ?? [];
  const canValidate = Boolean(parseResult && approvedReading && parseResult.records.length > 0);
  const showPreview = Boolean(parseResult) || (stage !== 'received' && stage !== 'ai-mapping-suggested');

  const validationChecks: IngestionValidationCheck[] = [
    {
      label: 'Archivo leido',
      status: fileDiagnostic || readError ? (readError ? 'warning' : 'ok') : 'ok',
      detail: fileDiagnostic?.detail ?? readError ?? 'Modo maqueta con datos de ejemplo.',
    },
    {
      label: 'Movimientos detectados',
      status: parseResult && parseResult.records.length > 0 ? 'ok' : 'warning',
      detail: parseResult ? `${parseResult.records.length} movimientos listos para revisar.` : 'Pendiente hasta subir un cash flow.',
    },
    {
      label: 'Periodo',
      status: parseResult?.monthRange && parseResult.monthRange !== 'No detectado' ? 'ok' : 'warning',
      detail: parseResult ? parseResult.monthRange : 'Pendiente de detectar meses.',
    },
    {
      label: 'Observaciones',
      status: issues.length ? 'warning' : 'ok',
      detail: issues.length ? `${issues.length} punto(s) para revisar antes de publicar.` : 'Sin observaciones criticas.',
    },
  ];

  const resetFileState = () => {
    setStage('received');
    setApprovedReading(false);
    setParseResult(null);
    setFileDiagnostic(null);
    setReadError(null);
    setPublishedMessage(null);
  };

  const readExcelFile = async (file: File) => {
    setFileName(file.name);
    resetFileState();

    try {
      const result = await detectCashFlowFile(file);

      if (!result) {
        setReadError('No se pudo leer el archivo.');
        return;
      }

      setParseResult(result);
      setFileDiagnostic({
        status: result.records.length > 0 && result.issues.length === 0 ? 'ok' : 'warning',
        title: result.records.length > 0 ? 'Cash flow detectado' : 'Requiere revision',
        detail:
          result.records.length > 0
            ? 'El sistema detecto una estructura de cash flow y preparo un preview para controlar.'
            : 'El archivo se leyo, pero no se pudo detectar una estructura suficiente para normalizar movimientos.',
        records: result.records.length,
        monthRange: result.monthRange,
      });
      setStage('ai-mapping-suggested');
    } catch (error) {
      setReadError(error instanceof Error ? error.message : 'No se pudo leer el archivo Excel.');
    }
  };

  const approveReading = () => {
    setApprovedReading(true);
    setStage('mapped');
  };

  const publishToDashboard = () => {
    if (!parseResult) return;

    savePublishedCashFlow({
      sourceFile: fileName,
      publishedAt: new Date().toISOString(),
      monthRange: parseResult.monthRange,
      recordCount: parseResult.records.length,
      monthlySummary: parseResult.monthlySummary,
      records: parseResult.records,
      previewRows: parseResult.records.slice(0, 25),
      issues: parseResult.issues,
      totals: normalizedTotals,
    });

    setStage('published');
    setPublishedMessage('Carga publicada. Ya podes verla en el dashboard global y en Finanzas > Cash Flow.');
  };

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
              <h1 className="mt-2 text-3xl font-semibold text-white">Carga de cash flow</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
                Subi el Excel como lo tenga el cliente. La plataforma detecta la estructura, arma un preview y bloquea la publicacion hasta que alguien lo controle.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Modelo estandar: {schema.name}
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
                <h2 className="text-xl font-semibold text-white">Archivo del cliente</h2>
                <p className="mt-1 text-sm text-zinc-400">La carga queda en revision hasta aprobarla.</p>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/45 px-4 py-8 text-center transition hover:border-emerald-500/50">
              <Upload size={26} className="text-emerald-300" />
              <span className="mt-3 text-sm font-medium text-zinc-200">Seleccionar Excel de cash flow</span>
              <span className="mt-1 text-xs text-zinc-500">XLSX, XLS o CSV</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readExcelFile(file);
                }}
              />
            </label>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/45 p-4 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Archivo actual</p>
              <p className="mt-1 font-medium text-zinc-100">{fileName}</p>
              {readError ? <p className="mt-2 text-xs text-amber-300">{readError}</p> : null}
              {publishedMessage ? (
                <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {publishedMessage}{' '}
                  <Link href="/dashboard" className="font-semibold underline underline-offset-4">
                    Ir al dashboard
                  </Link>
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2">
              <button onClick={approveReading} disabled={!parseResult || parseResult.records.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
                <Wand2 size={16} /> Aprobar lectura sugerida
              </button>
              <button onClick={() => setStage('pending-approval')} disabled={!canValidate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40">
                <ShieldCheck size={16} /> Validar datos
              </button>
              <button onClick={() => setStage('approved')} disabled={stage !== 'pending-approval'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40">
                <CheckCircle2 size={16} /> Aprobar carga
              </button>
              <button onClick={publishToDashboard} disabled={stage !== 'approved' || issues.length > 0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                Publicar en dashboard
              </button>
            </div>
          </article>

          <section className="space-y-6">
            {fileDiagnostic ? (
              <article className="glass rounded-2xl p-5 shadow-premium">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Lectura automatica</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">{fileDiagnostic.title}</h2>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs ${fileDiagnostic.status === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                    {fileDiagnostic.status === 'ok' ? 'Listo para controlar' : 'Revisar antes de publicar'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Movimientos</p>
                    <p className="mt-1 text-zinc-100">{fileDiagnostic.records}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Periodo detectado</p>
                    <p className="mt-1 text-zinc-100">{fileDiagnostic.monthRange}</p>
                  </div>
                </div>
                <div className={`mt-3 rounded-xl border p-3 text-sm ${fileDiagnostic.status === 'ok' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-200'}`}>
                  {fileDiagnostic.detail}
                </div>
              </article>
            ) : null}

            <IngestionValidationPanel checks={validationChecks} currentStage={ingestionStages[stage]} />
            <IngestionIssuesPanel issues={issues} />
          </section>
        </section>

        {showPreview ? (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <NormalizedPreviewTable rows={displayRows} totalRecords={parseResult?.records.length ?? displayRows.length} />
            <section className="space-y-6">
              <IngestionTotalsPanel totals={normalizedTotals} />
            </section>
          </section>
        ) : null}
      </section>
    </main>
  );
}
