// ai.controller.ts
import { Request, Response } from "express";
import { parseUserQuery } from "../services/openai.service";
import { searchProperties } from "../repositories/property.repository"; // Имя должно совпадать!

export async function aiSearch(req: Request, res: Response) {
  try {
    const { message } = req.body;

    // 1. Получаем JSON фильтры от OpenAI
    const aiFilters = await parseUserQuery(message);
    if (!aiFilters) {
        return res.status(400).json({ error: "Не удалось распознать запрос" });
    }
    
    console.log("AI Filters:", aiFilters);

    // 2. Ищем в базе, передавая эти фильтры
    const properties = await searchProperties(aiFilters);

    res.json({
      filters: aiFilters,
      properties,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}