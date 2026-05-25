import type { GenericCashFlowNormalizeResult } from '@/lib/parsers/genericWideCashFlow';

export type CashFlowReadingIntelligence = {
  format: 'Cash flow agrupado' | 'Cash flow detallado' | 'Cash flow con controles' | 'Formato insuficiente';
  mode: 'Lectura corregida automaticamente' | 'Lectura directa' | 'Requiere intervencion humana';
  decision: 'Publicable' | 'Revisar antes de publicar' | 'No publicar';
  summary: string;
  recommendation: string;
  correctionsApplied: string[];
  pendingAlerts: string[];
  evidence: string[];
  actions: string[];
};

const includesText = (values: string[], pattern: string) => values.some((value) => value.toLowerCase().includes(pattern));

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export function buildCashFlowReadingIntelligence(result: GenericCashFlowNormalizeResult): CashFlowReadingIntelligence {
  const diagnostic = result.readingDiagnostic;
  const reasons = diagnostic.reasons;
  const excludedReasons = diagnostic.excludedSamples.map((item) => item.reason);
  const issueTitles = result.issues.map((issue) => issue.title);
  const hasGroupedRows = includesText(reasons, 'agrupadoras') || includesText(excludedReasons, 'agrupadora');
  const hasControlTotals = includesText(reasons, 'total') || includesText(excludedReasons, 'total de');
  const hasBalances = result.balanceSummary.length > 0 || diagnostic.detectedRows.saldoFinalRow !== null;
  const hasIssues = result.issues.length > 0;
  const hasRecords = result.records.length > 0;

  const correctionsApplied = unique([
    hasGroupedRows ? 'Detecto filas padre y filas detalle; excluyo las filas agrupadoras para evitar doble conteo.' : '',
    hasControlTotals ? 'Detecto totales informados; los uso como control y no como movimientos.' : '',
    includesText(excludedReasons, 'neto') ? 'Detecto netos de control; los excluyo como movimientos.' : '',
    includesText(excludedReasons, 'saldo') ? 'Detecto saldos; los separo de ingresos y egresos.' : '',
  ]);

  if (!hasRecords || diagnostic.confidence === 'baja') {
    return {
      format: 'Formato insuficiente',
      mode: 'Requiere intervencion humana',
      decision: 'No publicar',
      summary: 'La lectura preventiva no encontro estructura suficiente para convertir este archivo en datos confiables.',
      recommendation: 'No publicar. Revisar si el archivo tiene meses, entradas, salidas y conceptos reconocibles.',
      correctionsApplied,
      pendingAlerts: unique([...issueTitles, 'No hay datos suficientes para una lectura confiable.']),
      evidence: [...reasons, ...issueTitles].slice(0, 5),
      actions: ['Corregir el archivo o subir una version con estructura mas clara.', 'Volver a ejecutar la lectura antes de aprobar.'],
    };
  }

  if (hasIssues) {
    return {
      format: hasGroupedRows ? 'Cash flow agrupado' : hasControlTotals ? 'Cash flow con controles' : 'Cash flow detallado',
      mode: 'Requiere intervencion humana',
      decision: 'Revisar antes de publicar',
      summary: 'La lectura preventiva aplico las correcciones posibles, pero todavia encontro diferencias o puntos que requieren revision humana.',
      recommendation: 'Revisar las observaciones, corregir el archivo o aceptar un ajuste controlado antes de publicar.',
      correctionsApplied,
      pendingAlerts: unique(issueTitles),
      evidence: [...reasons, ...issueTitles].slice(0, 6),
      actions: ['Abrir el detalle de observaciones.', 'Comparar los meses con diferencia contra el Excel.', 'Publicar solo cuando el control cierre o el ajuste este aprobado.'],
    };
  }

  if (hasGroupedRows) {
    return {
      format: 'Cash flow agrupado',
      mode: 'Lectura corregida automaticamente',
      decision: 'Publicable',
      summary: 'La lectura preventiva detecto riesgo de duplicacion entre grupos y detalle, corrigio la interpretacion y dejo una carga limpia.',
      recommendation: 'Aprobar si los totales visibles coinciden con los importes esperados. No hace falta corregir el Excel si los controles cierran.',
      correctionsApplied,
      pendingAlerts: [],
      evidence: [
        'Se excluyeron filas agrupadoras para evitar doble conteo.',
        hasControlTotals ? 'Se usaron totales informados como control.' : 'No se detectaron totales informados suficientes.',
        hasBalances ? 'Se detectaron saldos de cierre para control adicional.' : 'No se detectaron saldos de cierre.',
      ],
      actions: ['Aprobar lectura sugerida.', 'Validar datos.', 'Publicar en dashboard.'],
    };
  }

  if (hasControlTotals || hasBalances) {
    return {
      format: 'Cash flow con controles',
      mode: correctionsApplied.length ? 'Lectura corregida automaticamente' : 'Lectura directa',
      decision: 'Publicable',
      summary: correctionsApplied.length
        ? 'La lectura preventiva separo controles de movimientos y genero una carga limpia.'
        : 'La lectura preventiva detecto movimientos y controles sin necesidad de correcciones adicionales.',
      recommendation: 'Aprobar si el resumen coincide con el archivo original.',
      correctionsApplied,
      pendingAlerts: [],
      evidence: [
        hasControlTotals ? 'Hay totales informados para validar movimientos.' : 'No se detectaron totales por seccion.',
        hasBalances ? 'Hay saldos para validar caja.' : 'No hay saldos de cierre.',
        ...reasons.slice(0, 3),
      ],
      actions: ['Aprobar lectura sugerida.', 'Validar datos.', 'Publicar en dashboard.'],
    };
  }

  return {
    format: 'Cash flow detallado',
    mode: 'Lectura directa',
    decision: 'Publicable',
    summary: 'La lectura preventiva detecto entradas y salidas de detalle. Como no encontro controles fuertes, el sistema calcula el neto desde los movimientos.',
    recommendation: 'Puede publicarse para analisis de ingresos, egresos y neto, dejando aclarado que no fue validado contra totales o saldos del archivo.',
    correctionsApplied,
    pendingAlerts: [],
    evidence: reasons.slice(0, 5),
    actions: ['Aprobar lectura si los movimientos se ven razonables.', 'Agregar saldo inicial o totales en futuras cargas para elevar la confianza.'],
  };
}
