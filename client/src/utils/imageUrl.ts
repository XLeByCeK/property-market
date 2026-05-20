/**
 * Базовый URL Yandex Object Storage (path-style):
 *   https://storage.yandexcloud.net/<bucket>
 * Берётся из NEXT_PUBLIC_YANDEX_STORAGE_URL.
 */
const RAW_STORAGE_URL =
  process.env.NEXT_PUBLIC_YANDEX_STORAGE_URL || 'https://storage.yandexcloud.net/propertymarket';

const YANDEX_STORAGE_BASE_URL = RAW_STORAGE_URL.replace(/\/+$/, '');

/**
 * Префиксы путей, которые должны резолвиться в Yandex Object Storage.
 * Сравнение идёт без учёта ведущего слеша.
 */
const STORAGE_PATH_PREFIXES = ['property_images/'];

/** Плейсхолдеры, лежащие в client/public. */
export const PLACEHOLDER_NULL_IMAGE = '/images/placeholders/null-image.jpg';
export const PLACEHOLDER_AVATAR = '/images/placeholders/placeholder-avatar.png';
export const PLACEHOLDER_LOGO = '/static/placeholder-logo.png';
export const BANNER_BG_IMAGE = '/images/ui/banner-bg.jpg';

/**
 * Превращает значение `image_url` из БД в URL, пригодный для рендера.
 *
 * Правила:
 *  - пусто / null / undefined → `fallback`;
 *  - абсолютный URL (`http://`, `https://`, `data:`, `blob:`) → возвращается без изменений;
 *  - путь, ведущий в Yandex Object Storage (`/property_images/...`) → к нему дописывается базовый URL бакета;
 *  - всё остальное (например, `/images/placeholders/null-image.jpg`) считается локальной статикой клиента и возвращается как есть.
 */
export const getImageUrl = (
  url?: string | null,
  fallback: string = PLACEHOLDER_NULL_IMAGE
): string => {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  if (STORAGE_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return `${YANDEX_STORAGE_BASE_URL}/${normalized}`;
  }

  // Локальная статика клиента (placeholders, баннеры и т. п.)
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

/**
 * Хелпер для безопасной выборки главной картинки объекта.
 */
export const getMainImageUrl = <T extends { image_url?: string | null; is_main?: boolean }>(
  images: T[] | undefined | null,
  fallback: string = PLACEHOLDER_NULL_IMAGE
): string => {
  if (!images || images.length === 0) {
    return fallback;
  }

  const main = images.find((img) => img?.is_main && img.image_url);
  const first = images.find((img) => img?.image_url);

  return getImageUrl(main?.image_url ?? first?.image_url, fallback);
};
