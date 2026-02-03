import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseUserQuery(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
    Ты — эксперт по недвижимости. Извлеки фильтры из запроса.
    
    ВАЖНО: Возвращай только JSON.
    - city: Название города СТРОГО на английском (например, "Saint Petersburg", "Moscow").
    - transactionType: Строго одно из: "Rent" или "Sale".
    - propertyType: Строго одно из: "Apartment", "House", "Studio".
    - priceMin, priceMax, rooms: Числа или null.
  `
        },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI Error:", error);
    return null;
  }
}