// ai.controller.ts
import { Request, Response } from "express";
import { parseUserQuery } from "../services/openai.service";
import { searchProperties } from "../repositories/property.repository";

/**
 * Множитель «доводочной» стоимости квартиры без ремонта.
 * Используется на этапе MVP, когда у нас ещё нет точной формулы оценки
 * (площадь × цена ремонта в регионе и т.п.). Просто прибавляем 30%
 * к цене квартир без отделки и сравниваем уже эффективные стоимости.
 */
const NO_RENOVATION_COST_MULTIPLIER = 1.3;

type SearchedProperty = Awaited<ReturnType<typeof searchProperties>>[number];

interface AnalyzedProperty extends SearchedProperty {
  effective_price: number;
  renovation_surcharge: number;
}

/**
 * Считает «эффективную» стоимость объекта: цена + ориентировочные затраты
 * на ремонт, если отделки нет. Объекты с отделкой берём по реальной цене.
 */
function analyzeProperty(p: SearchedProperty): AnalyzedProperty {
  const hasRenovation = Boolean((p as any).has_renovation);
  const surcharge = hasRenovation
    ? 0
    : p.price * (NO_RENOVATION_COST_MULTIPLIER - 1);
  return {
    ...p,
    effective_price: p.price + surcharge,
    renovation_surcharge: surcharge,
  };
}

function formatPrice(value: number): string {
  return Math.round(value).toLocaleString("ru-RU");
}

/**
 * Сравнивает эффективные стоимости и выбирает «лучший» вариант:
 * минимальная итоговая цена с учётом возможных вложений в ремонт.
 * При равенстве предпочитает уже готовый (с отделкой) объект.
 */
function pickBestDeal(
  items: AnalyzedProperty[]
): { best: AnalyzedProperty | null; reasoning: string } {
  if (items.length === 0) {
    return { best: null, reasoning: "" };
  }

  const sorted = [...items].sort((a, b) => {
    if (a.effective_price !== b.effective_price) {
      return a.effective_price - b.effective_price;
    }
    const aRen = Boolean((a as any).has_renovation) ? 1 : 0;
    const bRen = Boolean((b as any).has_renovation) ? 1 : 0;
    return bRen - aRen;
  });

  const best = sorted[0];
  const hasRenovation = Boolean((best as any).has_renovation);

  let reasoning: string;
  if (items.length === 1) {
    reasoning = hasRenovation
      ? `Это единственный подходящий объект, и в нём уже есть отделка — цена ${formatPrice(
          best.price
        )} ₽ финальная.`
      : `Это единственный подходящий объект. Цена ${formatPrice(
          best.price
        )} ₽, но ремонта нет — с учётом ориентировочного бюджета на отделку (+30%) выйдет около ${formatPrice(
          best.effective_price
        )} ₽.`;
  } else if (hasRenovation) {
    reasoning = `Самый выгодный вариант — с готовой отделкой за ${formatPrice(
      best.price
    )} ₽: не нужно вкладываться в ремонт, и итоговая стоимость ниже, чем у альтернатив без отделки (где к цене добавятся ~30% на ремонт).`;
  } else {
    const renovatedCheapest = sorted.find((p) =>
      Boolean((p as any).has_renovation)
    );
    if (renovatedCheapest) {
      reasoning = `Самый выгодный вариант — без отделки за ${formatPrice(
        best.price
      )} ₽. Даже с учётом ремонта (~+30% = ${formatPrice(
        best.effective_price
      )} ₽) он дешевле ближайшего готового варианта (${formatPrice(
        renovatedCheapest.price
      )} ₽).`;
    } else {
      reasoning = `Среди подходящих вариантов нет ни одного с готовой отделкой. Этот — самый дешёвый: ${formatPrice(
        best.price
      )} ₽ + ориентировочно ${formatPrice(
        best.renovation_surcharge
      )} ₽ на ремонт ≈ ${formatPrice(best.effective_price)} ₽.`;
    }
  }

  return { best, reasoning };
}

export async function aiSearch(req: Request, res: Response) {
  try {
    const { message } = req.body;

    const aiFilters = await parseUserQuery(message);
    if (!aiFilters) {
      return res.status(400).json({ error: "Не удалось распознать запрос" });
    }

    console.log("AI Filters:", aiFilters);

    const properties = await searchProperties(aiFilters);

    const analyzed: AnalyzedProperty[] = properties.map(analyzeProperty);

    // По умолчанию ассистент всегда подсказывает лучший вариант — даже если
    // пользователь не просил об этом явно. Если в фильтрах findBestDeal === false,
    // просто возвращаем список без рекомендации.
    const wantsBestDeal = aiFilters.findBestDeal !== false;
    const { best, reasoning } = wantsBestDeal
      ? pickBestDeal(analyzed)
      : { best: null, reasoning: "" };

    // Сортируем выдачу по эффективной цене, если пользователь хочет «самый
    // выгодный» вариант — так лучшее предложение и его ближайшие конкуренты
    // будут в начале списка.
    const ordered = wantsBestDeal
      ? [...analyzed].sort((a, b) => a.effective_price - b.effective_price)
      : analyzed;

    res.json({
      filters: aiFilters,
      properties: ordered,
      recommended: best,
      reasoning,
      noRenovationMultiplier: NO_RENOVATION_COST_MULTIPLIER,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
