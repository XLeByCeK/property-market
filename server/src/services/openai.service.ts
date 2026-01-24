import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function parseUserQuery(message: string) {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: "Ты помощник по недвижимости. Отвечай ТОЛЬКО валидным JSON."
      },
      {
        role: "user",
        content: `
Извлеки фильтры из запроса:
"${message}"

Формат:
{
  "city": string | null,
  "priceMin": number | null,
  "priceMax": number | null,
  "rooms": number | null,
  "hasBalcony": boolean | null,
  "propertyType": "apartment" | "house" | null
}
`
      }
    ]
  });

  // The safe way to get the text
  const raw = response.output_text;

  if (!raw) {
    throw new Error("Empty AI response");
  }

  // Try parsing JSON
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error("AI response is not valid JSON: " + raw);
  }
}
