import { describe, expect, it } from 'vitest';
import { normalizeGenericWideCashFlow, type GenericCashFlowRow } from './genericWideCashFlow';

describe('normalizeGenericWideCashFlow', () => {
  it('normaliza un cash flow ancho con meses en columnas', () => {
    const rows: GenericCashFlowRow[] = [
      ['Concepto', 'ene-26', 'feb-26'],
      ['Cobranza clientes', 1000, 1500],
      ['Pago sueldos', -400, -500],
      ['Sin movimiento', 0, 0],
    ];

    const result = normalizeGenericWideCashFlow('Cash Flow', rows);

    expect(result.sourceSheet).toBe('Cash Flow');
    expect(result.monthRange).toBe('ene-26 a feb-26');
    expect(result.records).toHaveLength(4);
    expect(result.issues).toHaveLength(0);
    expect(result.records[0]).toMatchObject({
      period: 'ene-26',
      concept: 'Cobranza clientes',
      type: 'Entrada',
      income: 1000,
      expense: 0,
      net: 1000,
    });
    expect(result.records[2]).toMatchObject({
      period: 'ene-26',
      concept: 'Pago sueldos',
      type: 'Salida',
      income: 0,
      expense: 400,
      net: -400,
    });
    expect(result.monthlySummary).toEqual([
      { period: 'ene-26', records: 2, income: 1000, expense: 400, net: 600 },
      { period: 'feb-26', records: 2, income: 1500, expense: 500, net: 1000 },
    ]);
  });

  it('detecta meses cuando Excel los entrega como fechas numericas', () => {
    const rows: GenericCashFlowRow[] = [
      ['Concepto', 46023, 46054],
      ['Ventas', 200, 300],
    ];

    const result = normalizeGenericWideCashFlow('Fechas Excel', rows);

    expect(result.monthRange).toBe('ene-26 a feb-26');
    expect(result.records.map((record) => record.period)).toEqual(['ene-26', 'feb-26']);
  });

  it('devuelve una observacion clara si no detecta meses', () => {
    const rows: GenericCashFlowRow[] = [
      ['Concepto', 'Importe'],
      ['Ventas', 1000],
    ];

    const result = normalizeGenericWideCashFlow('Sin meses', rows);

    expect(result.records).toHaveLength(0);
    expect(result.monthRange).toBe('No detectado');
    expect(result.issues).toEqual([
      {
        group: 'estructura',
        title: 'No se detectaron meses',
        detail: 'La hoja no tiene columnas mensuales claras como mar-26, abr-26 o fechas de Excel.',
        count: 1,
      },
    ]);
  });
});
