import prisma from "../prisma";

export async function searchProperties(aiFilters: any) {
  console.log("Данные от ИИ в репозитории:", aiFilters);

  const where: any = {};

  // 1. Поиск Города (превращаем строку в ID)
  if (aiFilters.city) {
    const city = await prisma.city.findFirst({
      where: { name: { contains: aiFilters.city, mode: 'insensitive' } }
    });
    if (!city) return []; // Если город указан, но не найден — возвращаем пусто
    where.city_id = city.id;
  }

  // 2. Тип транзакции (Аренда/Продажа)
  if (aiFilters.transactionType) {
    const tType = await prisma.transaction_type.findFirst({
      where: { name: { contains: aiFilters.transactionType, mode: 'insensitive' } }
    });
    if (tType) {
      where.transaction_type_id = tType.id;
    }
  }

  // 3. Тип недвижимости (Квартира/Дом)
  if (aiFilters.propertyType) {
    const pType = await prisma.property_type.findFirst({
      where: { name: { contains: aiFilters.propertyType, mode: 'insensitive' } }
    });
    if (pType) {
      where.property_type_id = pType.id;
    }
  }

  // 4. Комнаты
  if (aiFilters.rooms) {
    where.rooms = Number(aiFilters.rooms);
  }

  // 5. Цена
  if (aiFilters.priceMin || aiFilters.priceMax) {
    where.price = {
      gte: aiFilters.priceMin ? Number(aiFilters.priceMin) : undefined,
      lte: aiFilters.priceMax ? Number(aiFilters.priceMax) : undefined,
    };
  }

  console.log("Финальный запрос к Prisma (where):", where);

  const properties = await prisma.property.findMany({
    where,
    include: {
      images: true,
      city: true,
      property_type: true
    },
    take: 10
  });

  // Возвращаем данные с основной картинкой
  return properties.map(p => ({
    ...p,
    image: p.images.find(img => img.is_main)?.image_url || p.images[0]?.image_url || null
  }));
}