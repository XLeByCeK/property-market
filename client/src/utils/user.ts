/**
 * Утилиты для работы с данными пользователя. Бэкенд отдаёт snake_case
 * (first_name/last_name), фронтенд частично использует camelCase
 * (firstName/lastName) — эти хелперы маскируют разницу.
 */

type AnyUser = {
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
} | null | undefined;

export const getFirstName = (user: AnyUser): string =>
  user?.firstName || user?.first_name || '';

export const getLastName = (user: AnyUser): string =>
  user?.lastName || user?.last_name || '';

export const getFullName = (user: AnyUser): string =>
  `${getFirstName(user)} ${getLastName(user)}`.trim();

export const getInitials = (user: AnyUser): string => {
  const f = getFirstName(user).charAt(0);
  const l = getLastName(user).charAt(0);
  return (f + l).toUpperCase();
};

/**
 * Возвращает пользователя с заполненными обоими стилями именования.
 * Полезно перед сохранением в state, чтобы UI мог обращаться к любому полю.
 */
export const normalizeUser = <T extends AnyUser>(user: T): T => {
  if (!user) return user;
  const result: any = { ...user };
  if (user.firstName && !user.first_name) result.first_name = user.firstName;
  if (user.lastName && !user.last_name) result.last_name = user.lastName;
  if (user.first_name && !user.firstName) result.firstName = user.first_name;
  if (user.last_name && !user.lastName) result.lastName = user.last_name;
  return result;
};
