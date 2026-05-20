/**
 * Форматирует число с разделителем тысяч пробелом: 1000000 → "1 000 000".
 * Раньше эта функция дублировалась в PropertyCard и PropertyContactCard.
 */
export const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/**
 * Форматирует рублёвую цену с символом валюты, например: 1500000 → "1 500 000 ₽".
 */
export const formatCurrency = (price: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);

/**
 * Локализованная дата (по умолчанию русский long-формат).
 * Возвращает пустую строку, если дата не передана или некорректна.
 */
export const formatDate = (
  dateString: string | undefined | null,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  } catch {
    return '';
  }
};

/** Короткая дата без года. */
export const formatShortDate = (dateString: string | undefined | null): string =>
  formatDate(dateString, { day: '2-digit', month: '2-digit', year: 'numeric' });
