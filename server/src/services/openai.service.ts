import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseUserQuery(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Рекомендую использовать 4o-mini за скорость и цену
      messages: [
        {
          role: "system",
          content: `
    Ты — продвинутый эксперт по недвижимости. Твоя задача — преобразовать запрос пользователя в структурированные фильтры для базы данных.
    
    ВАЖНО: Возвращай только чистый JSON.
    
    Поля для извлечения:
    - city: Название города на английском (например, "Saint Petersburg", "Moscow").
    - transactionType: "Аренда" или "Продажа".  
    - propertyType: "Apartment", "House", "Studio", "Commercial", "Country".
    - priceMin, priceMax: Числа (бюджет).
    - areaMin, areaMax: Площадь в кв.м.
    - rooms: Массив чисел (например, [1, 2] если запрос "1 или 2 комнатная").
    - floorMin, floorMax: Диапазон этажей.
    - isNewBuilding: boolean (true если "новостройка", "новый дом", false если "вторичка").
    - isCommercial: boolean (true если "офис", "склад", "торговая площадь").
    - district: Название района (на английском или как в запросе).
    - metroStation: Название станции метро.
    - metroDistanceMax: Максимальное расстояние до метро (если упомянуто, например "10 минут").
    - yearBuiltMin: Год постройки от (если "не старее 2010").

    Если параметр не указан в запросе, ставь null.
  `
        },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const filters = JSON.parse(response.choices[0].message.content || "{}");
    return filters;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return null;
  }
}