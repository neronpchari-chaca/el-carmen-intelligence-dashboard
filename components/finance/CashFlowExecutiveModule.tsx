'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, BrainCircuit, Landmark, LineChart as LineChartIcon, WalletCards } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { loadPublishedCashFlow, type PublishedCashFlowSnapshot } from '@/lib/ingestion/publishedCashFlowStore';

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (value: number) => moneyFormatter.format(value);

const formatMoneyTick = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${Math.round(value)}`;
};

const chartTooltipLabels: Record<string, { label: string; color: string }> = {
  ingresos: { label: 'Ingresos', color: '#63B58E' },
  egresos: { label: 'Egresos', color: '#E97373' },
  cajaAcumulada: { label: 'Disponible / necesidad', color: '#8BB8FF' },
};

function CashFlowTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;

  const visibleItems = payload.filter((item) => typeof item.value === 'number');

  return (
    <div className="min-w-[190px] rounded-xl border border-emerald-500/20 bg-[#07110D]/95 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">{label}</p>
      <div className="space-y-1.5">
        {visibleItems.map((item) => {
          const key = String(item.dataKey ?? '');
          const meta = chartTooltipLabels[key] ?? { label: key, color: '#cbd5e1' };
          const value = item.value ?? 0;
          const valueTone = key === 'cajaAcumulada' && value < 0 ? 'text-rose-300' : 'text-zinc-100';

          return (
            <div key={key} className="flex items-center justify-between gap-4 text-sm">
              <span className="inline-flex items-center gap-2 text-zinc-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </span>
              <span className={`font-medium ${valueTone}`}>{formatMoney(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildCashEvolution(snapshot: PublishedCashFlowSnapshot) {
  const balanceByPeriod = new Map((snapshot.balanceSummary ?? []).map((row) => [row.period, row.closingBalance]));
  let accumulated = 0;

  return snapshot.monthlySummary.map((row) => {
    accumulated += row.net;
    const hasClosingBalance = balanceByPeriod.has(row.period);
    const cajaAcumulada = hasClosingBalance ? (balanceByPeriod.get(row.period) ?? 0) : Math.round(accumulated * 100) / 100;

    return {
      periodo: row.period,
      ingresos: row.income,
      egresos: row.expense,
      neto: row.net,
      cajaAcumulada,
      fuenteCaja: hasClosingBalance ? 'Saldo final del archivo' : 'Acumulado calculado',
    };
  });
}

function buildExpensePareto(snapshot: PublishedCashFlowSnapshot) {
  const records = snapshot.records ?? snapshot.previewRows;
  const expenses = new Map<string, number>();

  for (const record of records) {
    if (record.expense <= 0) continue;
    expenses.set(record.concept, (expenses.get(record.concept) ?? 0) + record.expense);
  }

  return Array.from(expenses.entries())
    .map(([concepto, egresos]) => ({ concepto, egresos: Math.round(egresos * 100) / 100 }))
    .sort((a, b) => b.egresos - a.egresos)
    .slice(0, 8);
}

function buildAlerts(snapshot: PublishedCashFlowSnapshot, evolution: ReturnType<typeof buildCashEvolution>) {
  const alerts: Array<{ title: string; detail: string; tone: 'critical' | 'warning' | 'ok' }> = [];
  const worstMonth = evolution.reduce((worst, row) => (row.cajaAcumulada < worst.cajaAcumulada ? row : worst), evolution[0]);
  const negativeMonths = evolution.filter((row) => row.cajaAcumulada < 0);

  if (negativeMonths.length > 0) {
    alerts.push({
      title: 'Caja negativa detectada',
      detail: `${negativeMonths.length} mes(es) quedan con caja acumulada negativa. Primer mes: ${negativeMonths[0].periodo}.`,
      tone: 'critical',
    });
  }

  if (worstMonth) {
    alerts.push({
      title: 'Maxima exposicion de caja',
      detail: `${worstMonth.periodo} muestra la mayor exposicion: ${formatMoney(worstMonth.cajaAcumulada)} (${worstMonth.fuenteCaja}).`,
      tone: worstMonth.cajaAcumulada < 0 ? 'critical' : 'warning',
    });
  }

  const expenseJump = evolution.find((row, index) => {
    const previous = evolution[index - 1];
    return previous && previous.egresos > 0 && row.egresos > previous.egresos * 1.3;
  });

  if (expenseJump) {
    alerts.push({
      title: 'Aumento fuerte de egresos',
      detail: `${expenseJump.periodo} supera en mas de 30% los egresos del mes anterior.`,
      tone: 'warning',
    });
  }

  const records = snapshot.records ?? snapshot.previewRows;
  const topIncome = records
    .filter((record) => record.income > 0)
    .sort((a, b) => b.income - a.income)[0];

  if (topIncome && snapshot.totals.income > 0 && topIncome.income / snapshot.totals.income > 0.5) {
    alerts.push({
      title: 'Concentracion de ingresos',
      detail: `${topIncome.concept} concentra mas del 50% de los ingresos cargados.`,
      tone: 'warning',
    });
  }

  if (alerts.length === 0) {
    alerts.push({ title: 'Sin alertas criticas', detail: 'La carga publicada no muestra alertas financieras principales.', tone: 'ok' });
  }

  return alerts;
}

function EmptyCashFlowState() {
  return (
    <article className="glass rounded-2xl border border-zinc-800/80 p-5 shadow-premium">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">FINANZAS · Cash Flow</p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Todavia no hay cash flow publicado</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
        Para ver el modulo completo, primero subi un Excel desde Ingesta de Datos, revisalo y publicalo.
      </p>
    </article>
  );
}

export function FinanceModuleHome() {
  const modules = [
    { title: 'Cash Flow', detail: 'Caja, ingresos, egresos, alertas y detalle mensual.', status: 'Activo' },
    { title: 'Conciliaciones Bancarias', detail: 'Extractos, matching, diferencias y partidas pendientes.', status: 'Proximo' },
    { title: 'Cuentas por Cobrar', detail: 'Cobranza, mora, aging y concentracion de clientes.', status: 'Proximo' },
    { title: 'Cuentas por Pagar', detail: 'Vencimientos, proveedores, caja requerida y calendario.', status: 'Proximo' },
  ];

  return (
    <section className="space-y-6">
      <article className="glass rounded-2xl p-5 shadow-premium">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">FUNCIONES · Finanzas</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Area financiera modular</h2>
        <p className="mt-2 max-w-4xl text-sm text-zinc-400">
          Finanzas funciona como area madre. Cada funcionalidad tiene sus propias vistas, datos, controles y alertas.
        </p>
      </article>

      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <article key={module.title} className="glass rounded-2xl border border-zinc-800/80 p-5 shadow-premium">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{module.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{module.detail}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs ${module.status === 'Activo' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 bg-zinc-900/70 text-zinc-400'}`}>
                {module.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

export function CashFlowExecutiveModule() {
  const [snapshot, setSnapshot] = useState<PublishedCashFlowSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(loadPublishedCashFlow());
  }, []);

  const model = useMemo(() => {
    if (!snapshot) return null;

    const evolution = buildCashEvolution(snapshot);
    const expensePareto = buildExpensePareto(snapshot);
    const alerts = buildAlerts(snapshot, evolution);
    const currentCash = evolution.at(-1)?.cajaAcumulada ?? 0;
    const currentMonth = snapshot.monthlySummary.at(-1);
    const worstMonth = evolution.reduce((worst, row) => (row.cajaAcumulada < worst.cajaAcumulada ? row : worst), evolution[0]);
    const monthsWithExpense = snapshot.monthlySummary.filter((row) => row.expense > 0);
    const burnRate = monthsWithExpense.length
      ? monthsWithExpense.reduce((total, row) => total + row.expense, 0) / monthsWithExpense.length
      : 0;
    const runway = currentCash > 0 && burnRate > 0 ? `${Math.floor(currentCash / burnRate)} meses` : 'Sin cobertura';

    return { evolution, expensePareto, alerts, currentCash, currentMonth, worstMonth, burnRate, runway };
  }, [snapshot]);

  if (!snapshot || !model) return <EmptyCashFlowState />;

  const hasRealBalances = (snapshot.balanceSummary?.length ?? 0) > 0;

  const kpis = [
    { label: 'Caja acumulada cargada', value: formatMoney(model.currentCash), helper: hasRealBalances ? 'Segun saldo final del archivo.' : 'Calculada con movimientos publicados.', icon: <WalletCards size={16} /> },
    { label: 'Neto ultimo mes', value: formatMoney(model.currentMonth?.net ?? 0), helper: model.currentMonth?.period ?? 'Sin periodo', icon: <BarChart3 size={16} /> },
    { label: 'Maxima exposicion', value: formatMoney(model.worstMonth?.cajaAcumulada ?? 0), helper: model.worstMonth ? `${model.worstMonth.periodo} · ${model.worstMonth.fuenteCaja}` : 'Sin periodo', icon: <AlertTriangle size={16} /> },
    { label: 'Burn rate mensual', value: formatMoney(model.burnRate), helper: 'Promedio mensual de egresos.', icon: <LineChartIcon size={16} /> },
    { label: 'Runway financiero', value: model.runway, helper: 'Estimado con caja cargada y burn rate.', icon: <Landmark size={16} /> },
    { label: 'Resultado USD', value: 'Pendiente TC', helper: 'Listo para conectar tipo de cambio.', icon: <BrainCircuit size={16} /> },
  ];

  return (
    <section className="space-y-6">
      <article className="glass rounded-2xl p-5 shadow-premium">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">FINANZAS · Cash Flow</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Dashboard ejecutivo financiero</h2>
        <p className="mt-2 max-w-4xl text-sm text-zinc-400">
          Vista completa del cash flow publicado: caja, neto mensual, exposicion, burn rate, runway, alertas y estructura de gastos.
        </p>
        <p className="mt-3 text-xs text-zinc-500">Archivo: {snapshot.sourceFile} · Periodo: {snapshot.monthRange} · Movimientos: {snapshot.recordCount}</p>
      </article>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="glass rounded-2xl border border-zinc-800/80 p-4 shadow-premium">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-zinc-500">{kpi.icon}{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{kpi.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{kpi.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Evolucion mensual de caja acumulada</h3>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={model.evolution} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="periodo" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={formatMoneyTick} width={54} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip content={<CashFlowTooltip />} cursor={{ stroke: 'rgba(139, 184, 255, 0.35)', strokeWidth: 1 }} wrapperStyle={{ outline: 'none' }} />
              <Line type="monotone" dataKey="cajaAcumulada" name="Disponible / necesidad" stroke="#8BB8FF" strokeWidth={3} dot={{ r: 3, fill: '#07110D', stroke: '#8BB8FF', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#8BB8FF', stroke: '#07110D', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="glass h-80 rounded-2xl p-5 shadow-premium">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Ingresos vs egresos mensuales</h3>
          <ResponsiveContainer width="100%" height="88%">
            <ComposedChart data={model.evolution} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid stroke="#1F2B26" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="periodo" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis yAxisId="bars" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={formatMoneyTick} width={54} />
              <YAxis yAxisId="cash" orientation="right" stroke="#8BB8FF" tickLine={false} axisLine={false} tickFormatter={formatMoneyTick} width={42} />
              <ReferenceLine yAxisId="cash" y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip content={<CashFlowTooltip />} cursor={{ fill: 'rgba(139, 184, 255, 0.08)' }} wrapperStyle={{ outline: 'none' }} />
              <Bar yAxisId="bars" dataKey="ingresos" name="Ingresos" fill="#63B58E" radius={[5, 5, 0, 0]} maxBarSize={18} />
              <Bar yAxisId="bars" dataKey="egresos" name="Egresos" fill="#E97373" radius={[5, 5, 0, 0]} maxBarSize={18} />
              <Line yAxisId="cash" type="monotone" dataKey="cajaAcumulada" name="Disponible / necesidad" stroke="#8BB8FF" strokeWidth={2.7} dot={false} activeDot={{ r: 5, fill: '#8BB8FF', stroke: '#07110D', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="glass rounded-2xl border border-zinc-800/80 p-5 shadow-premium">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Alertas visuales</h3>
          <div className="mt-4 space-y-3">
            {model.alerts.map((alert) => (
              <div key={alert.title} className={`rounded-xl border p-3 ${alert.tone === 'critical' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : alert.tone === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs opacity-85">{alert.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass overflow-hidden rounded-2xl border border-zinc-800/80 shadow-premium">
          <div className="border-b border-zinc-800 bg-zinc-900/35 px-5 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Pareto de gastos</h3>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full text-sm text-zinc-300">
              <thead className="bg-zinc-900/50 text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Concepto</th>
                  <th className="px-4 py-3 text-right">Egreso</th>
                </tr>
              </thead>
              <tbody>
                {model.expensePareto.map((row) => (
                  <tr key={row.concepto} className="border-t border-zinc-800/80">
                    <td className="px-4 py-3 text-zinc-100">{row.concepto}</td>
                    <td className="px-4 py-3 text-right text-rose-300">{formatMoney(row.egresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="glass overflow-hidden rounded-2xl border border-zinc-800/80 shadow-premium">
        <div className="border-b border-zinc-800 bg-zinc-900/35 px-5 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Detalle mensual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-zinc-300">
            <thead className="bg-zinc-900/50 text-xs uppercase tracking-[0.15em] text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left">Mes</th>
                <th className="px-4 py-3 text-right">Ingresos</th>
                <th className="px-4 py-3 text-right">Egresos</th>
                <th className="px-4 py-3 text-right">Neto</th>
                <th className="px-4 py-3 text-right">Caja acumulada</th>
              </tr>
            </thead>
            <tbody>
              {model.evolution.map((row) => (
                <tr key={row.periodo} className="border-t border-zinc-800/80">
                  <td className="px-4 py-3 font-medium text-zinc-100">{row.periodo}</td>
                  <td className="px-4 py-3 text-right text-emerald-300">{formatMoney(row.ingresos)}</td>
                  <td className="px-4 py-3 text-right text-rose-300">{formatMoney(row.egresos)}</td>
                  <td className={`px-4 py-3 text-right ${row.neto >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>{formatMoney(row.neto)}</td>
                  <td className={`px-4 py-3 text-right ${row.cajaAcumulada >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{formatMoney(row.cajaAcumulada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
