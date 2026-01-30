// ----------------------------------------------------------------------

export function fNumber(number: string | number) {
  return new Intl.NumberFormat().format(Number(number));
}

export function fCurrency(number: string | number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(Number(number));
}

export function fPercent(number: string | number) {
  return new Intl.NumberFormat('en-US', { style: 'percent' }).format(Number(number) / 100);
}

export function fShortenNumber(number: string | number) {
  const num = Number(number);
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function fData(number: string | number) {
  return fShortenNumber(number) + ' b';
}
