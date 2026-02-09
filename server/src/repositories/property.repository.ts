import prisma from "../prisma";

export async function searchProperties(aiFilters: any) {
  console.log("Данные от ИИ в репозитории:", aiFilters);

  if (!aiFilters) return [];

  const where: any = {
    status: 'active' // Ищем только активные объявления
  };

  // 1. География: Город (превращаем строку в ID)
  if (aiFilters.city) {
    const city = await prisma.city.findFirst({
      where: { name: { contains: aiFilters.city, mode: 'insensitive' } }
    });
    if (city) {
      where.city_id = city.id;
    }
  }

  // 2. Тип транзакции (Rent/Sale)
  if (aiFilters.transactionType) {
    const tType = await prisma.transaction_type.findFirst({
      where: { name: { contains: aiFilters.transactionType, mode: 'insensitive' } }
    });
    if (tType) {
      where.transaction_type_id = tType.id;
    }
  }

  // 3. Тип недвижимости (Apartment, House, Studio и т.д.)
  if (aiFilters.propertyType) {
    const pType = await prisma.property_type.findFirst({
      where: { name: { contains: aiFilters.propertyType, mode: 'insensitive' } }
    });
    if (pType) {
      where.property_type_id = pType.id;
    }
  }

  // 4. Комнаты (поддержка массива или числа)
  if (aiFilters.rooms) {
    if (Array.isArray(aiFilters.rooms)) {
      where.rooms = { in: aiFilters.rooms.map((r: any) => Number(r)) };
    } else {
      where.rooms = Number(aiFilters.rooms);
    }
  }

  // 5. Цена (Диапазон)
  if (aiFilters.priceMin || aiFilters.priceMax) {
    where.price = {
      gte: aiFilters.priceMin ? Number(aiFilters.priceMin) : undefined,
      lte: aiFilters.priceMax ? Number(aiFilters.priceMax) : undefined,
    };
  }

  // 6. Площадь (Диапазон)
  if (aiFilters.areaMin || aiFilters.areaMax) {
    where.area = {
      gte: aiFilters.areaMin ? Number(aiFilters.areaMin) : undefined,
      lte: aiFilters.areaMax ? Number(aiFilters.areaMax) : undefined,
    };
  }

  // 7. Этаж (Диапазон)
  if (aiFilters.floorMin || aiFilters.floorMax) {
    where.floor = {
      gte: aiFilters.floorMin ? Number(aiFilters.floorMin) : undefined,
      lte: aiFilters.floorMax ? Number(aiFilters.floorMax) : undefined,
    };
  }

  // 8. Булевы параметры (Новостройка, Коммерция, Загородная)
  if (typeof aiFilters.isNewBuilding === 'boolean') {
    where.is_new_building = aiFilters.isNewBuilding;
  }
  if (typeof aiFilters.isCommercial === 'boolean') {
    where.is_commercial = aiFilters.isCommercial;
  }
  if (typeof aiFilters.isCountry === 'boolean') {
    where.is_country = aiFilters.isCountry;
  }

  // 9. Метро (расстояние)
  if (aiFilters.metroDistanceMax) {
    where.metro_distance = {
      lte: Number(aiFilters.metroDistanceMax)
    };
  }

  // 10. Год постройки
  if (aiFilters.yearBuiltMin) {
    where.year_built = {
      gte: Number(aiFilters.yearBuiltMin)
    };
  }

  console.log("Финальный запрос к Prisma (where):", JSON.stringify(where, null, 2));

  try {
    const properties = await prisma.property.findMany({
      where,
      include: {
        images: true,
        city: true,
        property_type: true,
        // Можно добавить district и metro если нужно на фронте
        district: true,
        metro_station: true 
      },
      orderBy: { created_at: 'desc' },
      take: 20
    });

    // Возвращаем данные с обработкой картинок
    return properties.map(p => ({
      ...p,
      // Берём главную картинку или самую первую из массива
      image: p.images.find(img => img.is_main)?.image_url || p.images[0]?.image_url || null
    }));
  } catch (error) {
    console.error("Database Search Error:", error);
    return [];
  }
}