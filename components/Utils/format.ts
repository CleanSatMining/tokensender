import { BigNumber } from 'bignumber.js';

export const formatUsd = (
  tvl: number,
  digit = 0,
  symbol = '$',
  currency = 'USD',
  oraclePrice = 1,
  hasData = true
) => {
  if (symbol === '€') {
    currency = 'EUR';
  }
  if (!hasData) return ` - ${symbol}`;

  // TODO: bignum?
  if (oraclePrice) {
    tvl /= oraclePrice;
  }
  const order = Math.floor(Math.log10(tvl) / 3);

  const units = ['', 'k', 'M', 'B', 'T'];
  const shouldShowUnits = order > 1; // only use units if 1M+
  let unitToDisplay = '';
  let num = tvl;

  if (shouldShowUnits) {
    num = tvl / 1000 ** order;
    unitToDisplay = units[order];
  }
  const prefix = symbol;
  const digitSmallNumber = digit === 0 ? 2 : digit;

  return num < 999
    ? prefix + num.toFixed(digitSmallNumber) + unitToDisplay
    : tvl.toLocaleString('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: digit,
        minimumFractionDigits: digit,
      });
};

export const formatSimpleUsd = (
  tvl: number,
  hasData = true,
  digit = 0,
  symbol = '$',
  currency = 'USD',
  oraclePrice = 1
) => formatUsd(tvl, digit, symbol, currency, oraclePrice, hasData);
/**
 * Formats a number to output as a percent% string
 * @param percent as decimal e.g. 0.01 to represent 1%
 * @param dp
 * @param placeholder
 */
export const formatPercent = (
  percent: number | null | undefined,
  dp = 2,
  placeholder: string = '?'
) => {
  if (!percent && percent !== 0) return placeholder;

  if (percent === 0) {
    return '0%';
  }

  // Convert to number
  const numberPercent: number = percent * 100;

  const units = ['', 'k', 'M', 'B', 'T', 'Q', 'S'];
  const order = Math.floor(Math.log10(numberPercent) / 3);

  // Show fire symbol if very large %
  if (order >= units.length - 1) return '🔥';

  // Magnitude to display
  let unitToDisplay = '';
  let num: number = numberPercent;
  if (order > 1) {
    num = numberPercent / 1000 ** order;
    unitToDisplay = units[order];
  }

  // Format output
  return num < 999
    ? `${num.toFixed(dp)}${unitToDisplay}%`
    : `${numberPercent.toLocaleString('en-US', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })}%`;
};

export function formatSmallPercent(
  percent: number,
  maxPlaces = 2,
  minPlaces = 0,
  formatZero = false,
  hasData = true
): string {
  if (!hasData) return '- %';

  return !formatZero && percent === 0
    ? '0%'
    : `${(percent * 100).toLocaleString('en-US', {
        maximumFractionDigits: maxPlaces,
        minimumFractionDigits: minPlaces,
      })}%`;
}

export function formatBigNumber(num: number) {
  let value = new BigNumber(num);
  value = value.decimalPlaces(2, BigNumber.ROUND_FLOOR);

  if (value.isZero()) {
    return '0';
  }
  const order = getBigNumOrder(value);
  if (value.abs().gte(100)) {
    value = value.decimalPlaces(0, BigNumber.ROUND_FLOOR);
  }
  if (order < 2 && value.abs().gte(100)) {
    return value.toNumber().toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
  const units = ['', 'k', 'M', 'B', 'T'];

  return value.shiftedBy(-order * 3).toFixed(2) + units[order];
}

export function getBigNumOrder(num: BigNumber): number {
  const nEstr = num.abs().decimalPlaces(0, BigNumber.ROUND_FLOOR).toExponential();
  const parts = nEstr.split('e');
  const exp = parseInt(parts[1] || '0', 10);
  return Math.floor(exp / 3);
}

export function formatFullNumber(
  num: number,
  maxDp = 2,
  roundMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP
) {
  let value = new BigNumber(num);
  value = value.decimalPlaces(2, BigNumber.ROUND_HALF_UP);
  return stripTrailingZeros(
    value.toFormat(maxDp, roundMode, {
      prefix: '',
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: '.',
      fractionGroupSize: 0,
      suffix: '',
    })
  );
}
export function formatFullBigNumber(
  value: BigNumber,
  maxDp = 2,
  roundMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP
) {
  value = value.decimalPlaces(2, BigNumber.ROUND_HALF_UP);
  return stripTrailingZeros(
    value.toFormat(maxDp, roundMode, {
      prefix: '',
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: '.',
      fractionGroupSize: 0,
      suffix: '',
    })
  );
}

export const stripTrailingZeros = (str: string) =>
  str.replace(/(\.[0-9]*?)(0+$)/, '$1').replace(/\.$/, '');

export function formatBigDecimals(num: number, maxPlaces = 8, strip = true) {
  const value = new BigNumber(num);

  if (value.isZero() && strip) {
    return '0';
  }

  const fixed = value.toFixed(maxPlaces);
  return strip ? stripTrailingZeros(fixed) : fixed;
}

export function formatBTC(num: number) {
  return `${formatBigDecimals(num)}₿`;
}

export function formatTimestamp(timestamp: number): string {
  // Convertir le timestamp en millisecondes en multipliant par 1000
  const date = new Date(timestamp);

  // Utiliser les méthodes de l'objet Date pour extraire les composants de la date
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  // Retourner la date formatée
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
export function formatTimestampDay(timestamp: number): string {
  // Convertir le timestamp en millisecondes en multipliant par 1000
  const date = new Date(timestamp);

  // Utiliser les méthodes de l'objet Date pour extraire les composants de la date
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  // Retourner la date formatée
  return `${day}/${month}/${year}`;
}
export function formatTimestampHour(timestamp: number): string {
  // Convertir le timestamp en millisecondes en multipliant par 1000
  const date = new Date(timestamp);

  // Utiliser les méthodes de l'objet Date pour extraire les composants de la date
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  // Retourner la date formatée
  return `${hours}:${minutes}:${seconds}`;
}
