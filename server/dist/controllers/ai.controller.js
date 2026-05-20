"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSearch = aiSearch;
const openai_service_1 = require("../services/openai.service");
const property_repository_1 = require("../repositories/property.repository"); // Имя должно совпадать!
async function aiSearch(req, res) {
    try {
        const { message } = req.body;
        // 1. Получаем JSON фильтры от OpenAI
        const aiFilters = await (0, openai_service_1.parseUserQuery)(message);
        if (!aiFilters) {
            return res.status(400).json({ error: "Не удалось распознать запрос" });
        }
        console.log("AI Filters:", aiFilters);
        // 2. Ищем в базе, передавая эти фильтры
        const properties = await (0, property_repository_1.searchProperties)(aiFilters);
        res.json({
            filters: aiFilters,
            properties,
        });
    }
    catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
