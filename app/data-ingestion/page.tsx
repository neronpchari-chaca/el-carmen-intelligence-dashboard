'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Bot, CheckCircle2, FileSpreadsheet, History, ShieldCheck, Upload, Wand2 } from 'lucide-react';
import { exampleCashFlowIngestionProfiles, ingestionStages, standardDatasetSchemas, type IngestionStage } from '@/config/dataIngestion';
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
  { period: 'may-26', account: 'Banco 1', group: 'Cobranza', concept: 'Cobranza cliente X', income: 100000, expense: 0, currency: 'ARS' },
  { period: 'may-26', account: 'Banco 1', group: 'Sueldos', concept: 'Pago sueldos planta', income: 0, expense: 52000, currency: 'ARS' },
  { period: 'may-26', account: 'Banco 2', group: 'Proveedor', concept: 'Pago insumos', income: 0, expense: 38000, currency: 'ARS' },
  { period: 'may-26', account: 'Banco 1', group: 'Cobranza', concept: 'Cobranza distribuidor', income: 64000, expense: 0, currency: 'ARS' },
];

const ingestionHistory = [
  { version: 'v1.9', file: 'cash_flow_cliente_demo_abril.xlsx', date: '22 may 2026 18:35', owner: 'Control de Gestion', status: 'Publicado', records: 128, warnings: 0, net: 513000 },
  { version: 'v1.8', file: 'cash_flow_cliente_demo_marzo.xlsx', date: '18 abr 2026 11:20', owner: 'Finanzas', status: 'Publicado', records: 117, warnings: 1, net: 438500 },
  { version: 'v1.7', file: 'cash_flow_cliente_demo_febrero.xlsx', date: '19 mar 2026 09:42', owner: 'Finanzas', status: 'Observado', records: 119, warnings: 4, net: 392800 },
];

const auditTrail = [
  'Archivo recibido y conservado como fuente original.',
  'Mapeo sugerido por IA pendiente de aprobacion humana.',
  'Moneda o pais aplicado por perfil del cliente cuando el archivo no lo informa.',
  'Categorias y saldos se validan antes de publicacion.',
  'Publicacion requiere aprobacion de usuario responsable.',
];

type FileDiagnostic = {
  sheetNames: string[];
  hasHoja1: boolean;
  hasMapaCuentas: boolean;
  hoja1Months: string[];
  mapaMonths: string[];
  missingInMapa: string[];
  status: 'ok' | 'warning';
  suggestion: string;
};

const MONTH_PATTERN = /^[a-z]{3}-\d{2}$/i;
const MONTH_ABBREVIATIONS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

const normalizeRows = (rows: unknown[][]): CashFlowBrasilRow[] =>
  rows.map((row) => row.map((cell): CashFlowBrasilCell => (typeof cell === 'number' || typeof cell === 'string' ? cell : cell == null ? null : String(cell))));

const fallbackTotals = { income: 164000, expense: 90000 };
const formatMoney = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const normalizeMonth = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 30000 && value < 60000) {
    const date = new Date(EXCEL_EPOCH_UTC + value * 24 * 60 * 60 * 1000);
    return `${MONTH_ABBREVIATIONS[date.getUTCMonth()]}-${String(date.getUTCFullYear()).slice(-2)}`;
  }

  const normalized = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace('.', '');

  return MONTH_PATTERN.test(normalized) ? normalized : null;
};

const extractMonths = (rows: CashFlowBrasilRow[]) => {
  const months: string[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    for (const cell of row) {
      const month = normalizeMonth(cell);
      if (month && !seen.has(month)) {
        seen.add(month);
        months.push(month);
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

const buildFileDiagnostic = (sheetNames: string[], hoja1Rows?: CashFlowBrasilRow[], mapaRows?: CashFlowBrasilRow[]): FileDiagnostic => {
  const hoja1Months = hoja1Rows ? extractMonths(hoja1Rows) : [];
  const mapaMonths = mapaRows ? extractMonths(mapaRows.slice(0, 1)) : [];
  const missingInMapa = hoja1Months.filter((month) => !mapaMonths.includes(month));
  const hasHoja1 = Boolean(hoja1Rows);
  const hasMapaCuentas = Boolean(mapaRows);

  if (!hasMapaCuentas) {
    return {
      sheetNames,
      hasHoja1,
      hasMapaCuentas,
      hoja1Months,
      mapaMonths,
      missingInMapa: [],
      status: 'warning',
      suggestion: 'No hay Mapa cuentas. La plataforma deberia crear un mapa temporal desde la hoja principal antes de cargar.',
    };
  }

  if (missingInMapa.length > 0) {
    return {
      sheetNames,
      hasHoja1,
      hasMapaCuentas,
      hoja1Months,
      mapaMonths,
      missingInMapa,
      status: 'warning',
      suggestion: `Hay saldos hasta ${hoja1Months[hoja1Months.length - 1]}, pero el mapa llega hasta ${mapaMonths[mapaMonths.length - 1] ?? 'sin meses'}. Falta completar ${missingInMapa.join(', ')} en Mapa cuentas.`,
    };
  }

  return {
    sheetNames,
    hasHoja1,
    hasMapaCuentas,
    hoja1Months,
    mapaMonths,
    missingInMapa,
    status: 'ok',
    suggestion: 'La estructura del archivo parece consistente para iniciar validaciones.',
  };
};

export default function DataIngestionPage() {
  const [stage, setStage] = useState<IngestionStage>('received');
  const [fileName, setFileName] = useState('cash_flow_cliente_demo_mayo.xlsx');
  const [approvedMappings, setApprovedMappings] = useState<Record<string, boolean>>({});
  const [parseResult, setParseResult] = useState<CashFlowBrasilParseResult | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [fileDiagnostic, setFileDiagnostic] = useState<FileDiagnostic | null>(null);

  const schema = standardDatasetSchemas.find((item) => item.id === 'cash-flow') ?? standardDatasetSchemas[0];
  const profile = parseResult
    ? exampleCashFlowIngestionProfiles.find((item) => item.id === 'el-carmen-cashflow-brasil-wide-months') ?? exampleCashFlowIngestionProfiles[0]
    : exampleCashFlowIngestionProfiles.find((item) => item.id === 'cliente-demo-cashflow-bancos') ?? exampleCashFlowIngestionProfiles[0];

  const progressIndex = stageOrder.indexOf(stage);
  const approvedCount = useMemo(
    () => profile.mappings.filter((mapping) => approvedMappings[mapping.clientColumn] || mapping.approved).length,
    [approvedMappings, profile.mappings],
  );

  const displayRows = parseResult
    ? parseResult.records.slice(0, 12).map((row) => ({
        period: row.period,
        account: row.type,
        group: row.group,
        concept: row.account,
        income: row.income,
        expense: row.expense,
        currency: row.currency,
      }))
    : demoRows;

  const normalizedTotals = useMemo(() => {
    if (parseResult) {
      return parseResult.monthlySummary.reduce(
        (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense }),
        { income: 0, expense: 0 },
      );
    }

    return demoRows.reduce(
      (totals, row) => ({ income: totals.income + row.income, expense: totals.expense + row.expense }),
      { income: 0, expense: 0 },
    );
  }, [parseResult]);

  const balanceStatus = parseResult?.balanceChecks.every((check) => check.status === 'ok') ? 'ok' : parseResult ? 'warning' : 'ok';
  const balanceObservations = parseResult?.balanceChecks.filter((check) => check.status !== 'ok') ?? [];
  const largestBalanceObservation = balanceObservations.reduce(
    (largest, check) => (Math.abs(check.difference) > Math.abs(largest?.difference ?? 0) ? check : largest),
    balanceObservations[0],
  );
  const sourceTotals = parseResult ? normalizedTotals : fallbackTotals;
  const netAmount = normalizedTotals.income - normalizedTotals.expense;
  const allMappingsApproved = approvedCount === profile.mappings.length;
  const showPreview = Boolean(parseResult) || (stage !== 'received' && stage !== 'ai-mapping-suggested');

  const validationChecks = [
    { label: 'Archivo leido', status: parseResult ? 'ok' : readError ? 'warning' : 'ok', detail: parseResult ? 'Se detectaron hojas Mapa cuentas y Hoja1.' : readError ?? 'Modo maqueta con datos de ejemplo.' },
    { label: 'Registros normalizados', status: 'ok', detail: `${parseResult?.records.length ?? demoRows.length} registros disponibles para preview.` },
    { label: 'Moneda', status: parseResult ? 'ok' : 'warning', detail: parseResult ? 'BRL aplicada por perfil Cash Flow Brasil.' : 'ARS aplicada por perfil demo.' },
    {
      label: 'Control de saldos',
      status: balanceStatus,
      detail: parseResult
        ? largestBalanceObservation
          ? balanceObservations.length === 1
            ? `${parseResult.balanceChecks.filter((check) => check.status === 'ok').length}/${parseResult.balanceChecks.length} meses conciliados. ${largestBalanceObservation.period} no cierra por ${formatMoney(largestBalanceObservation.difference)} BRL. Ver detalle abajo.`
            : `${parseResult.balanceChecks.filter((check) => check.status === 'ok').length}/${parseResult.balanceChecks.length} meses conciliados. ${balanceObservations.length} meses no cierran. Mayor diferencia: ${largestBalanceObservation.period}, ${formatMoney(largestBalanceObservation.difference)} BRL. Ver detalle abajo.`
          : `${parseResult.balanceChecks.filter((check) => check.status === 'ok').length}/${parseResult.balanceChecks.length} meses conciliados.`
        : 'No aplica en modo demo.',
    },
    { label: 'Advertencias', status: parseResult?.warnings.length ? 'warning' : 'ok', detail: parseResult?.warnings.length ? parseResult.warnings.join(' ') : 'Sin advertencias criticas.' },
  ];

  const simulateAiMapping = () => setStage('ai-mapping-suggested');
  const approveAllMappings = () => {
    setApprovedMappings(Object.fromEntries(profile.mappings.map((mapping) => [mapping.clientColumn, true])));
    setStage('mapped');
  };
  const runValidation = () => setStage('pending-approval');
  const approveLoad = () => setStage('approved');
  const publishLoad = () => setStage('published');

  const readExcelFile = async (file: File) => {
    setFileName(file.name);
    setStage('received');
    setApprovedMappings({});
    setParseResult(null);
    setReadError(null);
    setFileDiagnostic(null);

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const mapaSheet = workbook.Sheets['Mapa cuentas'];
      const hoja1Sheet = workbook.Sheets['Hoja1'];
      const mapaRows = mapaSheet ? normalizeRows(XLSX.utils.sheet_to_json(mapaSheet, { header: 1, raw: true, defval: null }) as unknown[][]) : undefined;
      const hoja1Rows = hoja1Sheet ? normalizeRows(XLSX.utils.sheet_to_json(hoja1Sheet, { header: 1, raw: true, defval: null }) as unknown[][]) : undefined;

      setFileDiagnostic(buildFileDiagnostic(workbook.SheetNames, hoja1Rows, mapaRows));

      if (!mapaRows || !hoja1Rows) {
        setReadError('El archivo no contiene las hojas esperadas: Mapa cuentas y Hoja1.');
        return;
      }

      const result = parseCashFlowBrasil({ sourceFile: file.name, mapaCuentasRows: mapaRows, hoja1Rows });

      setParseResult(result);
      setStage('ai-mapping-suggested');
    } catch (error) {
      setReadError(error instanceof Error ? error.message : 'No se pudo leer el archivo Excel.');
    }
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
                Subi un Excel real de Cash Flow Brasil o usa el flujo demo. La plataforma lee hojas, normaliza registros y valida saldos antes de publicar.
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
              <span className="mt-1 text-xs text-zinc-500">XLSX o CSV · parser Brasil si detecta hojas esperadas</span>
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
                    <p className="mt-1 text-zinc-100">{fileDiagnostic.hasMapaCuentas ? 'Con mapa de cuentas' : 'Sin mapa: requiere mapa temporal'}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Meses en Hoja1</p>
                    <p className="mt-1 text-zinc-100">{formatMonthRange(fileDiagnostic.hoja1Months)}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3 text-sm text-zinc-300">
                    <p className="text-xs text-zinc-500">Meses en Mapa cuentas</p>
                    <p className="mt-1 text-zinc-100">{formatMonthRange(fileDiagnostic.mapaMonths)}</p>
                  </div>
                </div>
                <div className={`mt-3 rounded-xl border p-3 text-sm ${fileDiagnostic.status === 'ok' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-200'}`}>
                  {fileDiagnostic.suggestion}
                </div>
              </article>
            ) : null}

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
                  {parseResult?.records.length ?? displayRows.length} registros detectados
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
                    <p className="text-xs text-zinc-500">Ingresos archivo / normalizado</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">{sourceTotals.income.toLocaleString('es-AR')} / {normalizedTotals.income.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Egresos archivo / normalizado</p>
                    <p className="mt-1 text-sm font-semibold text-rose-300">{sourceTotals.expense.toLocaleString('es-AR')} / {normalizedTotals.expense.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">
                    <p className="text-xs text-zinc-500">Neto a publicar</p>
                    <p className="mt-1 text-lg font-semibold text-sky-300">{netAmount.toLocaleString('es-AR')} {parseResult ? 'BRL' : 'ARS'}</p>
                  </div>
                </div>
              </article>

              <article className="glass rounded-2xl p-5 shadow-premium">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Impacto si se publica</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Resumen ejecutivo</h2>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  <li className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">Se actualizaria Cash Flow desde archivo {fileName}.</li>
                  <li className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">El neto detectado es {netAmount.toLocaleString('es-AR')} {parseResult ? 'BRL' : 'ARS'}.</li>
                  <li className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-200">La publicacion sigue bloqueada hasta aprobacion humana.</li>
                </ul>
              </article>
            </section>
          </section>
        ) : null}

        {showPreview && parseResult?.balanceChecks.length ? (
          <article className="glass rounded-2xl p-5 shadow-premium">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Detalle de conciliacion</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Control mensual de saldos</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${balanceStatus === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                {parseResult.balanceChecks.filter((check) => check.status === 'ok').length}/{parseResult.balanceChecks.length} meses OK
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-zinc-300">
                <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Mes</th>
                    <th className="px-3 py-2 text-right">Saldo anterior</th>
                    <th className="px-3 py-2 text-right">Neto app</th>
                    <th className="px-3 py-2 text-right">Neto Excel</th>
                    <th className="px-3 py-2 text-right">Dif. neto</th>
                    <th className="px-3 py-2 text-right">Saldo esperado</th>
                    <th className="px-3 py-2 text-right">Saldo Excel</th>
                    <th className="px-3 py-2 text-right">Dif. saldo</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.balanceChecks.map((check) => (
                    <tr key={check.period} className="border-t border-zinc-800">
                      <td className="px-3 py-3 font-medium text-zinc-100">{check.period}</td>
                      <td className="px-3 py-3 text-right">{formatMoney(check.openingBalance)}</td>
                      <td className="px-3 py-3 text-right text-sky-300">{formatMoney(check.normalizedNet)}</td>
                      <td className="px-3 py-3 text-right">{check.spreadsheetNet === undefined ? '-' : formatMoney(check.spreadsheetNet)}</td>
                      <td className={`px-3 py-3 text-right font-semibold ${Math.abs(check.netDifference ?? 0) <= 0.01 ? 'text-emerald-300' : 'text-amber-300'}`}>{check.netDifference === undefined ? '-' : formatMoney(check.netDifference)}</td>
                      <td className="px-3 py-3 text-right">{formatMoney(check.calculatedClosingBalance)}</td>
                      <td className="px-3 py-3 text-right">{formatMoney(check.closingBalance)}</td>
                      <td className={`px-3 py-3 text-right font-semibold ${Math.abs(check.difference) <= 0.01 ? 'text-emerald-300' : 'text-amber-300'}`}>{formatMoney(check.difference)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2 py-1 text-xs ${check.status === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                          {check.status === 'ok' ? 'OK' : 'Revisar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {balanceObservations.length ? (
              <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-amber-300">Observaciones para resolver</p>
                <div className="mt-3 grid gap-3">
                  {balanceObservations.map((check) => {
                    const netMismatch = check.netDifference !== undefined && Math.abs(check.netDifference) > 0.01;
                    return (
                      <div key={check.period} className="rounded-xl border border-amber-500/20 bg-zinc-950/35 p-4 text-sm text-zinc-200">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <p className="font-semibold text-amber-200">{check.period}: diferencia de saldo {formatMoney(check.difference)} BRL</p>
                          <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">Requiere decision</span>
                        </div>
                        <p className="mt-3 text-zinc-300">
                          {netMismatch
                            ? `El neto que entra al modelo es ${formatMoney(check.normalizedNet)} BRL, pero el Excel informa ${formatMoney(check.spreadsheetNet ?? 0)} BRL.`
                            : 'El saldo final no coincide con el saldo anterior mas el neto calculado por la plataforma.'}
                        </p>
                        <div className="mt-3 grid gap-2 md:grid-cols-3">
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900/55 p-3">
                            <p className="font-medium text-zinc-100">1. Revisar movimientos</p>
                            <p className="mt-1 text-xs text-zinc-400">Buscar si faltan lineas o columnas del mes en Mapa cuentas.</p>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900/55 p-3">
                            <p className="font-medium text-zinc-100">2. Corregir y resubir</p>
                            <p className="mt-1 text-xs text-zinc-400">Si falta detalle, completar el archivo y cargarlo nuevamente.</p>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900/55 p-3">
                            <p className="font-medium text-zinc-100">3. Dejar observado</p>
                            <p className="mt-1 text-xs text-zinc-400">Si el dato es correcto, aprobarlo luego con una nota de control.</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </article>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="glass rounded-2xl p-5 shadow-premium">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-emerald-300"><History size={20} /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Historial</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Cargas anteriores</h2>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-zinc-300">
                <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Version</th>
                    <th className="px-3 py-2 text-left">Archivo</th>
                    <th className="px-3 py-2 text-left">Responsable</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-right">Registros</th>
                    <th className="px-3 py-2 text-right">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestionHistory.map((load) => (
                    <tr key={load.version} className="border-t border-zinc-800">
                      <td className="px-3 py-3 text-emerald-200">{load.version}</td>
                      <td className="px-3 py-3"><p>{load.file}</p><p className="text-xs text-zinc-500">{load.date}</p></td>
                      <td className="px-3 py-3">{load.owner}</td>
                      <td className="px-3 py-3"><span className={`rounded-full border px-2 py-1 text-xs ${load.status === 'Publicado' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>{load.status}</span></td>
                      <td className="px-3 py-3 text-right">{load.records}</td>
                      <td className="px-3 py-3 text-right text-sky-300">{load.net.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="glass rounded-2xl p-5 shadow-premium">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Trazabilidad</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Rastro de control</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {auditTrail.map((item) => <li key={item} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-3">{item}</li>)}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
