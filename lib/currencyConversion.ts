import type { CountryCode } from '@/data/mockData';

export type ExchangeRateRow = {
  month: string;
  country: CountryCode;
  currency: string;
  tcUsd: number;
  source: string;
  type: string;
};

export type OperationalAmountInput = {
  month: string;
  country: CountryCode;
  amount: number;
  currency: string;
};

export type OperationalAmountInUsd = {
  originalAmount: number;
  originalCurrency: string;
  appliedExchangeRate: number;
  usdAmount: number;
};

const COUNTRIES_WITH_DIVISION_CONVERSION: CountryCode[] = ['argentina', 'brasil'];

export function validateProjectedExchangeRateWindow(rows: ExchangeRateRow[]): { ok: boolean; message: string } {
  const months = new Set(rows.map((row) => row.month));
  if (months.size > 12) {
    return { ok: false, message: 'Solo se admiten hasta 12 meses proyectados' };
  }

  return { ok: true, message: 'Ventana mensual válida' };
}

export function convertOperationalAmountToUsd(
  input: OperationalAmountInput,
  exchangeRates: ExchangeRateRow[],
): OperationalAmountInUsd {
  const matchingRate = exchangeRates.find((row) => row.month === input.month && row.country === input.country);

  if (!matchingRate) {
    throw new Error('Falta tipo de cambio para el mes');
  }

  if (!COUNTRIES_WITH_DIVISION_CONVERSION.includes(input.country)) {
    throw new Error('País no soportado para conversión');
  }

  return {
    originalAmount: input.amount,
    originalCurrency: input.currency,
    appliedExchangeRate: matchingRate.tcUsd,
    usdAmount: input.amount / matchingRate.tcUsd,
  };
}
