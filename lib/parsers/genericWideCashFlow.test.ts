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

  it('excluye saldos y respeta secciones de entradas y salidas', () => {
    const rows: GenericCashFlowRow[] = [
      [null, null, 'mar-26', 'abr-26', 'may-26'],
      [null, 'SALDO ANTERIOR', -401395.82, -97952.04, 74764.22],
      [null, 'SAIDAS'],
      [null, 'Pago proveedor', -100, -120, -130],
      [null, 'ENTRADAS'],
      [null, 'Credito Aporte', 503718.15, 294161.72, 0],
      [null, 'Royalties', 0, 0, 18165],
      [null, 'SALDO FINAL', -97952.04, 74764.22, -31522.06],
    ];

    const result = normalizeGenericWideCashFlow('Hoja1', rows);

    expect(result.records.map((record) => record.concept)).not.toContain('SALDO ANTERIOR');
    expect(result.records.map((record) => record.concept)).not.toContain('SALDO FINAL');
    expect(result.monthlySummary).toEqual([
      { period: 'mar-26', records: 2, income: 503718.15, expense: 100, net: 503618.15 },
      { period: 'abr-26', records: 2, income: 294161.72, expense: 120, net: 294041.72 },
      { period: 'may-26', records: 2, income: 18165, expense: 130, net: 18035 },
    ]);
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
