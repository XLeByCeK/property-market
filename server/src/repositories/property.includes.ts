import { Prisma } from '@prisma/client';

/**
 * Стандартный набор связанных сущностей, который возвращается клиенту
 * вместе с объектом недвижимости. Вынесен в одно место, чтобы листинги,
 * поиск, избранное и история просмотров возвращали одинаковую структуру.
 */
export const propertyInclude = {
  user: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      phone: true,
    },
  },
  property_type: true,
  transaction_type: true,
  city: true,
  district: true,
  metro_station: true,
  images: true,
} satisfies Prisma.propertyInclude;

/**
 * Облегчённый include для страниц «Мои объявления» — без данных продавца
 * и со строгим порядком изображений.
 */
export const userPropertyInclude: Prisma.propertyInclude = {
  property_type: true,
  transaction_type: true,
  city: true,
  images: {
    orderBy: { order: 'asc' },
  },
};
