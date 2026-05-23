'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, ShieldCheck, Upload, Wand2 } from 'lucide-react';
import { exampleCashFlowIngestionProfiles, ingestionStages, standardDatasetSchemas, type IngestionStage } from '@/config/dataIngestion';
import { PublicationGatePanel } from '@/components/ingestion/PublicationGatePanel';
import { buildPublicationGate } from '@/lib/ingestion/publicationGate';
import { buildTemporaryMapReview, type TemporaryMapReviewResult } from '@/lib/ingestion/temporaryMapWorkflow';
import { parseCashFlowBrasil, type CashFlowBrasilCell, type CashFlowBrasilParseResult, type CashFlowBrasilRow } from '@/lib/parsers/cashFlowBrasil';

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

const demoRows = [
  { period: 'may-26', account: 'Banco 1', group: 'Cobranza', concept: 'Cobranza cliente X', income: 100000, expense: 0 },
  { period: 'may-26', account: 'Banco 1', group: 'Sueldos', concept: 'Pago sueldos planta', income: 0, expense: 52000 },
  { period: 'may-26', account: 'Banco 2', group: 'Proveedor', concept: 'Pago insumos', income: 0, expense: 38000 },
  { period: 'may-26', account: 'Banco 1', group: 'Cobranza', concept: 'Cobranza distribuidor', income: 64000, expense: 0 },
];

const MONTH_PATTERN = /^[a-z]{3}-\d{2}$/i;
const MONTH_ABBREVIATIONS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

type FileDiagnostic = {
  sheetNames: string[];
  primarySheetName?: string;
  hasMapaCuentas: boolean;
  primaryMonths: string[];
  mapaMonths: string[];
  status: 'ok' | 'warning';
  suggestion: string;
};

type TemporaryMapProposal = {
  sheetName: string;
  monthRange: string;
  detectedConcepts: Array<{ label: string; sampleAmount: number; suggestedType: 'Entrada' | 'Salida' | 'Revisar' }>;
  nextSteps: string[];
};

const normalizeRows = (rows: unknown[][]): CashFlowBrasilRow[] =>
  rows.map((row) => row.map((cell): CashFlowBrasilCell => (typeof cell === 'number' || typeof cell === 'string' ? cell : cell == null ? null : String(cell))));

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const normalizeMonth = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 30000 && value < 60000) {
    const date = new Date(EXCEL_EPOCH_UTC + value * 24 * 60 * 60 * 1000);
    return `${MONTH_ABBREVIATIONS[date.getUTCMonth()]}-${String(date.getUTCFullYear()).slice(-2)}`;
  }

  const normalized = normalizeText(value)
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace('.', '');

  return MONTH_PATTERN.test(normalized) ? normalized : null;
};

const parseAmount = (value: CashFlowBrasilCell): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const text = String(value ?? '')
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractMonths = (rows: CashFlowBrasilRow[]) => {
  const months: string[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    for (const cell of row) {
      const month = normalizeMonth(cell);
      if (month && !seen.has(month)) {
        months.push(month);
        seen.add(month);
      }
    }
  }

  return months;
};

const formatMonthRange = (months: string[]) => {
  if (months.length === 0) return 'No detectado';
  if (months.length === 1) return months[0];
  return `${months[0]} a ${months[months.length - 1]}`;
};

const formatMoney = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const findMonthHeaderRowIndex = (rows: CashFlowBrasilRow[]) => rows.findIndex((row) => row.filter((cell) => normalizeMonth(cell)).length >= 2);

const buildTemporaryMapProposal = (sheetName: string, rows: CashFlowBrasilRow[]): TemporaryMapProposal | null => {
  const headerIndex = findMonthHeaderRowIndex(rows);
  if (headerIndex < 0) return null;

  const headerRow = rows[headerIndex];
  const monthIndexes = headerRow
    .map((cell, index) => ({ month: normalizeMonth(cell), index }))
    .filter((item): item is { month: string; index: number } => Boolean(item.month));

  const concepts = rows
    .slice(headerIndex + 1)
    .map((row) => {
      const label = row
        .slice(0, Math.max(monthIndexes[0]?.index ?? 1, 1))
        .map((cell) => String(cell ?? '').trim())
        .filter(Boolean)
        .join(' / ');
      const sampleAmount = monthIndexes.reduce((total, item) => total + parseAmount(row[item.index]), 0);
      const suggestedType = sampleAmount > 0 ? 'Entrada' : sampleAmount < 0 ? 'Salida' : 'Revisar';
      return { label, sampleAmount, suggestedType };
    })
    .filter((item) => item.label && item.sampleAmount !== 0)
    .slice(0, 8);

  return {
    sheetName,
    monthRange: formatMonthRange(monthIndexes.map((item) => item.month)),
    detectedConcepts: concepts,
    nextSteps: [
      'Revisar si los conceptos detectados representan cuentas reales.',
      'Confirmar moneda y criterio de entrada/salida.',
      'Generar preview normalizado antes de validar o publicar.',
    ],
  };
};

const buildFileDiagnostic = (
  sheetNames: string[],
  primarySheetName?: string,
  primaryRows?: CashFlowBrasilRow[],
  mapaRows?: CashFlowBrasilRow[],
): FileDiagnostic => {
  const primaryMonths = primaryRows ? extractMonths(primaryRows) : [];
  const mapaMonths = mapaRows ? extractMonths(mapaRows.slice(0, 1)) : [];
  const hasMapaCuentas = Boolean(mapaRows);
  const missingInMapa = primaryMonths.filter((month) => !mapaMonths.includes(month));

  if (!hasMapaCuentas) {
    return {
      sheetNames,
      primarySheetName,
      hasMapaCuentas,
      primaryMonths,
      mapaMonths,
      status: 'warning',
      suggestion: primaryRows
        ? `No hay Mapa cuentas. Se puede proponer un mapa temporal usando la hoja ${primarySheetName}.`
        : 'No hay Mapa cuentas y no se encontro una hoja principal clara.',
    };
  }

  if (missingInMapa.length > 0) {
    return {
      sheetNames,
      primarySheetName,
      hasMapaCuentas,
      primaryMonths,
      mapaMonths,
      status: 'warning',
      suggestion: `Hay meses en la hoja principal que no estan en Mapa cuentas: ${missingInMapa.join(', ')}.`,
    };
  }

  return {
    sheetNames,
    primarySheetName,
    hasMapaCuentas,
    primaryMonths,
    mapaMonths,
    status: 'ok',
    suggestion: 'La estructura del archivo parece consistente para iniciar validaciones.',
  };
};

export default function DataIngestionPage() {
  const [stage, setStage] = useState<IngestionStage>('received');
  const [fileName, setFileName] = useState('cash_flow_cliente_demo_mayo.xlsx');
  const [approvedMappings, setApprovedMappings] = useState<Record<string, boolean>>({});
  const [parseResult, setParseResult] = useState<CashFlowBrasilParseResult | null>(null);
  const [temporaryMapProposal, setTemporaryMapProposal] = useState<TemporaryMapProposal | null>(null);
  const [temporaryMapReview, setTemporaryMapReview] = useState<TemporaryMapReviewResult | null>(null);
  const [fileDiagnostic, setFileDiagnostic] = useState<FileDiagnostic | null>(null);
  const [primaryRows, setPrimaryRows] = useState<CashFlowBrasilRow[] | null>(null);
  const [primarySheetName, setPrimarySheetName] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const schema = standardDatasetSchemas.find((item) => item.id === 'cash-flow') ?? standardDatasetSchemas[0];
  const profile = parseResult
    ? exampleCashFlowIngestionProfiles.find((item) => item.id === 'el-carmen-cashflow-brasil-wide-months') ?? exampleCashFlowIngestionProfiles[0]
    : exampleCashFlowIngestionProfiles.find((item) => item.id === 'cliente-demo-cashflow-bancos') ?? exampleCashFlowIngestionProfiles[0];

  const approvedCount = useMemo(
    () => profile.mappings.filter((mapping) => approvedMappings[mapping.clientColumn] || mapping.approved).length,
    [approvedMappings, profile.mappings],
  );
  const progressIndex = stageOrder.indexOf(stage);

  const displayRows = parseResult
    ? parseResult.records.slice(0, 12).map((row) => ({
        period: row.period,
        account: row.type,
        group: row.group,
        concept: row.account,
        income: row.income,
        expense: row.expense,
      }))
    : temporaryMapReview
      ? temporaryMapReview.previewRows.map((row) => ({
          period: row.period,
          account: row.type,
          group: 'Pendiente de clasificar',
          concept: row.concept,
          income: row.income,
          expense: row.expense,
        }))
      : demoRows;

  const normalizedTotals = useMemo(() => {
    if (parseResult) {
      return parseResult.monthlySummary.reduce(
        (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense }),
        { income: 0, expense: 0 },
      );
    }

    if (temporaryMapReview) {
      return temporaryMapReview.monthlySummary.reduce(
        (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense }),
        { income: 0, expense: 0 },
      );
    }

    return demoRows.reduce(
      (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense }),
      { income: 0, expense: 0 },
    );
  }, [parseResult, temporaryMapReview]);

  const balanceChecks = parseResult?.balanceChecks ?? [];
  const balanceObservations = balanceChecks.filter((check) => check.status !== 'ok');
  const allMappingsApproved = approvedCount === profile.mappings.length;
  const netAmount = normalizedTotals.income - normalizedTotals.expense;
  const publicationGate = temporaryMapReview
    ? buildPublicationGate({
        hasAccountMap: false,
        temporaryMapReview,
        currencyConfirmed: false,
        accountsClassified: false,
        balancesValidated: false,
        humanApproved: stage === 'approved' || stage === 'published',
      })
    : null;
  const canValidate = parseResult ? allMappingsApproved : temporaryMapReview?.status === 'ready-for-validation';
  const canPublish = parseResult ? stage === 'approved' : publicationGate?.status === 'ready' && stage === 'approved';
  const showPreview = Boolean(parseResult || temporaryMapReview) || (stage !== 'received' && stage !== 'ai-mapping-suggested');

  const validationChecks = [
    {
      label: 'Archivo leido',
      status: parseResult || temporaryMapProposal || temporaryMapReview ? 'ok' : readError ? 'warning' : 'ok',
      detail: parseResult
        ? 'Se detectaron hojas Mapa cuentas y Hoja1.'
        : temporaryMapReview
          ? `Mapa temporal revisado desde ${temporaryMapReview.sourceSheet}.`
          : temporaryMapProposal
            ? `Se detecto una hoja principal: ${temporaryMapProposal.sheetName}.`
            : readError ?? 'Modo maqueta con datos de ejemplo.',
    },
    {
      label: 'Registros normalizados',
      status: temporaryMapReview?.status === 'needs-review' ? 'warning' : 'ok',
      detail: temporaryMapReview
        ? `${temporaryMapReview.recordsDetected} registros normalizados desde mapa temporal.`
        : `${parseResult?.records.length ?? demoRows.length} registros disponibles para preview.`,
    },
    {
      label: 'Moneda',
      status: parseResult ? 'ok' : 'warning',
      detail: parseResult ? 'BRL aplicada por perfil Cash Flow Brasil.' : 'Pendiente de confirmar por perfil del cliente.',
    },
    {
      label: 'Control de saldos',
      status: parseResult && balanceObservations.length === 0 ? 'ok' : 'warning',
      detail: temporaryMapReview
        ? 'Pendiente hasta confirmar moneda, clasificacion y validacion de saldos.'
        : parseResult
          ? `${balanceChecks.filter((check) => check.status === 'ok').length}/${balanceChecks.length} meses conciliados.`
          : 'No aplica en modo demo.',
    },
    {
      label: 'Advertencias',
      status: parseResult?.warnings.length || temporaryMapReview?.issueGroups.length ? 'warning' : 'ok',
      detail: parseResult?.warnings.length
        ? parseResult.warnings.join(' ')
        : temporaryMapReview?.issueGroups.length
          ? `${temporaryMapReview.issueGroups.length} grupo(s) para revisar.`
          : 'Sin advertencias criticas.',
    },
  ];

  const resetFileState = () => {
    setStage('received');
    setApprovedMappings({});
    setParseResult(null);
    setTemporaryMapProposal(null);
    setTemporaryMapReview(null);
    setFileDiagnostic(null);
    setPrimaryRows(null);
    setPrimarySheetName(null);
    setReadError(null);
  };

  const readExcelFile = async (file: File) => {
    setFileName(file.name);
    resetFileState();

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
      const mapaSheet = workbook.Sheets['Mapa cuentas'];
      const hoja1Sheet = workbook.Sheets['Hoja1'];
      const firstRows = firstSheet ? normalizeRows(XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true, defval: null }) as unknown[][]) : undefined;
      const mapaRows = mapaSheet ? normalizeRows(XLSX.utils.sheet_to_json(mapaSheet, { header: 1, raw: true, defval: null }) as unknown[][]) : undefined;
      const hoja1Rows = hoja1Sheet ? normalizeRows(XLSX.utils.sheet_to_json(hoja1Sheet, { header: 1, raw: true, defval: null }) as unknown[][]) : undefined;
      const candidateRows = hoja1Rows ?? firstRows;
      const candidateSheetName = hoja1Rows ? 'Hoja1' : firstSheetName;

      setPrimaryRows(candidateRows ?? null);
      setPrimarySheetName(candidateSheetName ?? null);
      setFileDiagnostic(buildFileDiagnostic(workbook.SheetNames, candidateSheetName, candidateRows, mapaRows));

      if (!mapaRows && candidateRows && candidateSheetName) {
        const proposal = buildTemporaryMapProposal(candidateSheetName, candidateRows);
        setTemporaryMapProposal(proposal);
        setReadError(proposal ? 'No se publica todavia: primero revisa el mapa temporal propuesto.' : 'No se pudo armar un mapa temporal con esta hoja.');
        setStage('ai-mapping-suggested');
        return;
      }

      if (!mapaRows || !hoja1Rows) {
        setReadError('El archivo no contiene las hojas esperadas: Mapa cuentas y Hoja1.');
        return;
      }

      setParseResult(parseCashFlowBrasil({ sourceFile: file.name, mapaCuentasRows: mapaRows, hoja1Rows }));
      setStage('ai-mapping-suggested');
    } catch (error) {
      setReadError(error instanceof Error ? error.message : 'No se pudo leer el archivo Excel.');
    }
  };

  const approveAllMappings = () => {
    setApprovedMappings(Object.fromEntries(profile.mappings.map((mapping) => [mapping.clientColumn, true])));
    setStage('mapped');
  };

  const markTemporaryMapReviewed = () => {
    if (!primarySheetName || !primaryRows) return;
    setTemporaryMapReview(buildTemporaryMapReview(primarySheetName, primaryRows));
    setReadError(null);
    setStage('mapped');
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
              <h1 className="mt-2 text-3xl font-semibold text-white">Flujo de carga, normalizacion y aprobacion</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
                Subi un Excel real de Cash Flow Brasil o usa el flujo demo. La plataforma lee hojas, normaliza registros y valida antes de publicar.
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
              <span className="mt-1 text-xs text-zinc-500">XLSX o CSV · con mapa o una hoja principal</span>
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
              <p className="mt-2 text-xs text-zinc-500">Perfil: {profile.sourceName}</p>
              {readError ? <p className="mt-2 text-xs text-amber-300">{readError}</p> : null}
            </div>

            <div className="mt-4 grid gap-2">
              <button onClick={() => setStage('ai-mapping-suggested')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400">
                <Wand2 size={16} /> Sugerir mapeo con IA
              </button>
              <button onClick={() => setStage('pending-approval')} disabled={!canValidate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40">
                <ShieldCheck size={16} /> Validar datos
              </button>
              <button onClick={() => setStage('approved')} disabled={stage !== 'pending-approval'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40">
                <CheckCircle2 size={16} /> Aprobar carga
              </button>
              <button onClick={() => setStage('published')} disabled={!canPublish} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                Publicar en dashboard
              </button>
            </div>
          </article>

          <section className="space-y-6">
            {fileDiagnostic ? (
              <article className="glass rounded-2xl p-5 shadow-premium">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Diagnostico del archivo</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Lectura inteligente</h2>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs ${fileDiagnostic.status === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                    {fileDiagnostic.status === 'ok' ? 'Estructura consistente' : 'Revisar estructura'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Hojas encontradas</p>
                    <p className="mt-1 text-zinc-100">{fileDiagnostic.sheetNames.join(', ')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Tipo de lectura</p>
                    <p className="mt-1 text-zinc-100">{fileDiagnostic.hasMapaCuentas ? 'Con mapa de cuentas' : `Sin mapa: usar ${fileDiagnostic.primarySheetName ?? 'hoja principal'}`}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Meses hoja principal</p>
                    <p className="mt-1 text-zinc-100">{formatMonthRange(fileDiagnostic.primaryMonths)}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Meses Mapa cuentas</p>
                    <p className="mt-1 text-zinc-100">{formatMonthRange(fileDiagnostic.mapaMonths)}</p>
                  </div>
                </div>
                <div className={`mt-3 rounded-xl border p-3 text-sm ${fileDiagnostic.status === 'ok' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-200'}`}>
                  {fileDiagnostic.suggestion}
                </div>
              </article>
            ) : null}

            {temporaryMapProposal ? (
              <article className="glass rounded-2xl p-5 shadow-premium">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Archivo sin mapa</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Mapa temporal propuesto</h2>
                  </div>
                  <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">Requiere revision</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Hoja usada</p>
                    <p className="mt-1 text-zinc-100">{temporaryMapProposal.sheetName}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Meses detectados</p>
                    <p className="mt-1 text-zinc-100">{temporaryMapProposal.monthRange}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Conceptos de muestra</p>
                    <p className="mt-1 text-zinc-100">{temporaryMapProposal.detectedConcepts.length}</p>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm text-zinc-300">
                    <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Concepto detectado</th>
                        <th className="px-3 py-2 text-right">Importe muestra</th>
                        <th className="px-3 py-2 text-left">Lectura sugerida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {temporaryMapProposal.detectedConcepts.map((item) => (
                        <tr key={`${item.label}-${item.sampleAmount}`} className="border-t border-zinc-800">
                          <td className="px-3 py-3">{item.label}</td>
                          <td className="px-3 py-3 text-right">{formatMoney(item.sampleAmount)}</td>
                          <td className="px-3 py-3 text-emerald-200">{item.suggestedType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <p className="font-medium">Como seguir</p>
                  <ul className="mt-2 space-y-1">
                    {temporaryMapProposal.nextSteps.map((step) => <li key={step}>{step}</li>)}
                  </ul>
                </div>
                <button onClick={markTemporaryMapReviewed} className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                  Marcar propuesta revisada y generar preview
                </button>
              </article>
            ) : null}

            {temporaryMapReview ? (
              <article className="glass rounded-2xl p-5 shadow-premium">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Mapa temporal revisado</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Preview listo para validar</h2>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs ${temporaryMapReview.status === 'ready-for-validation' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                    {temporaryMapReview.status === 'ready-for-validation' ? 'Listo para validar' : 'Requiere revision'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Hoja</p>
                    <p className="mt-1 text-zinc-100">{temporaryMapReview.sourceSheet}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Meses</p>
                    <p className="mt-1 text-zinc-100">{temporaryMapReview.monthRange}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Registros</p>
                    <p className="mt-1 text-zinc-100">{temporaryMapReview.recordsDetected}</p>
                  </div>
                </div>
              </article>
            ) : null}

            {publicationGate ? <PublicationGatePanel gate={publicationGate} /> : null}

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
                  {parseResult?.records.length ?? temporaryMapReview?.recordsDetected ?? displayRows.length} registros detectados
                </span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm text-zinc-300">
                  <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Periodo</th>
                      <th className="px-3 py-2 text-left">Tipo/Cuenta</th>
                      <th className="px-3 py-2 text-left">Grupo</th>
                      <th className="px-3 py-2 text-left">Concepto</th>
                      <th className="px-3 py-2 text-right">Ingreso</th>
                      <th className="px-3 py-2 text-right">Egreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row) => (
                      <tr key={`${row.period}-${row.concept}`} className="border-t border-zinc-800">
                        <td className="px-3 py-3">{row.period}</td>
                        <td className="px-3 py-3">{row.account}</td>
                        <td className="px-3 py-3 text-emerald-200">{row.group}</td>
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
                    <p className="text-xs text-zinc-500">Ingresos normalizados</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">{normalizedTotals.income.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Egresos normalizados</p>
                    <p className="mt-1 text-sm font-semibold text-rose-300">{normalizedTotals.expense.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Neto a publicar</p>
                    <p className="mt-1 text-lg font-semibold text-sky-300">{netAmount.toLocaleString('es-AR')} {parseResult ? 'BRL' : temporaryMapReview ? 'moneda pendiente' : 'ARS'}</p>
                  </div>
                </div>
              </article>
            </section>
          </section>
        ) : null}
      </section>
    </main>
  );
}
