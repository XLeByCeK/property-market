"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserQuery = parseUserQuery;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
async function parseUserQuery(message) {
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
    - priceMin, priceMax: Числа (бюджет). Если пользователь не назвал бюджет — null.
    - areaMin, areaMax: Площадь в кв.м.
    - rooms: Массив чисел (например, [1, 2] если запрос "1 или 2 комнатная").
    - floorMin, floorMax: Диапазон этажей.
    - isNewBuilding: boolean (true если "новостройка", "новый дом", false если "вторичка").
    - isCommercial: boolean (true если "офис", "склад", "торговая площадь").
    - district: Название района (на английском или как в запросе).
    - metroStation: Название станции метро.
    - metroDistanceMax: Максимальное расстояние до метро (если упомянуто, например "10 минут").
    - yearBuiltMin: Год постройки от (если "не старее 2010").
    - hasRenovation: boolean | null. true — если пользователь хочет ТОЛЬКО объекты С отделкой/ремонтом
      ("с ремонтом", "с отделкой", "готовые к проживанию", "евроремонт"). false — если пользователь
      явно ищет ТОЛЬКО объекты БЕЗ отделки ("без отделки", "под чистовую", "под ремонт",
      "черновая отделка"). null — если пользователь не уточняет (по умолчанию ассистент сам сравнит
      варианты с ремонтом и без, чтобы найти самый выгодный).
    - findBestDeal: boolean. true — если пользователь явно или косвенно просит найти самый ВЫГОДНЫЙ
      вариант ("выгодное", "самое дешёвое", "лучшее предложение", "посоветуй", "что лучше взять",
      "помоги выбрать"). По умолчанию false — ассистент ищет наилучшие варианты только 
      когда указывается цена либо когда пользователь явно или косвенно просит найти самый выгодный вариант.

    Если параметр не указан в запросе, ставь null (кроме findBestDeal — он по умолчанию false).
  `
                },
                { role: "user", content: message }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });
        const filters = JSON.parse(response.choices[0].message.content || "{}");
        return filters;
    }
    catch (error) {
        console.error("OpenAI Error:", error);
        return null;
    }
}
