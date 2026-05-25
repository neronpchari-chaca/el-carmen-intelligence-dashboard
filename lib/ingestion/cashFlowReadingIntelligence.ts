import type { GenericCashFlowNormalizeResult } from '@/lib/parsers/genericWideCashFlow';

export type CashFlowReadingIntelligence = {
  format: 'Cash flow agrupado' | 'Cash flow detallado' | 'Cash flow con controles' | 'Formato insuficiente';
  decision: 'Publicable' | 'Revisar antes de publicar' | 'No publicar';
  summary: string;
  recommendation: string;
  evidence: string[];
  actions: string[];
};

const includesText = (values: string[], pattern: string) => values.some((value) => value.toLowerCase().includes(pattern));

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

  if (!hasRecords || diagnostic.confidence === 'baja') {
    return {
      format: 'Formato insuficiente',
      decision: 'No publicar',
      summary: 'La IA no tiene estructura suficiente para convertir este archivo en datos confiables.',
      recommendation: 'No publicar. Revisar si el archivo tiene meses, entradas, salidas y conceptos reconocibles.',
      evidence: [...reasons, ...issueTitles].slice(0, 5),
      actions: ['Corregir el archivo o subir una version con estructura mas clara.', 'Volver a ejecutar la lectura antes de aprobar.'],
    };
  }

  if (hasIssues) {
    return {
      format: hasGroupedRows ? 'Cash flow agrupado' : hasControlTotals ? 'Cash flow con controles' : 'Cash flow detallado',
      decision: 'Revisar antes de publicar',
      summary: 'La IA pudo interpretar el archivo, pero encontro diferencias o puntos que requieren revision humana.',
      recommendation: 'Revisar las observaciones, corregir el archivo o aceptar un ajuste controlado antes de publicar.',
      evidence: [...reasons, ...issueTitles].slice(0, 6),
      actions: ['Abrir el detalle de observaciones.', 'Comparar los meses con diferencia contra el Excel.', 'Publicar solo cuando el control cierre o el ajuste este aprobado.'],
    };
  }

  if (hasGroupedRows) {
    return {
      format: 'Cash flow agrupado',
      decision: 'Publicable',
      summary: 'La IA detecto filas agrupadoras y filas detalle. Para evitar doble conteo, propone usar solo el detalle y dejar los grupos como control.',
      recommendation: 'Aprobar la lectura si los totales visibles coinciden con los importes esperados.',
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
      decision: 'Publicable',
      summary: 'La IA detecto movimientos y controles. Los importes pueden validarse contra totales, neto o saldos disponibles.',
      recommendation: 'Aprobar si el resumen coincide con el archivo original.',
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
    decision: 'Publicable',
    summary: 'La IA detecto entradas y salidas de detalle. Como no encontro controles fuertes, el sistema calcula el neto desde los movimientos.',
    recommendation: 'Puede publicarse para analisis de ingresos, egresos y neto, dejando aclarado que no fue validado contra totales o saldos del archivo.',
    evidence: reasons.slice(0, 5),
    actions: ['Aprobar lectura si los movimientos se ven razonables.', 'Agregar saldo inicial o totales en futuras cargas para elevar la confianza.'],
  };
}
