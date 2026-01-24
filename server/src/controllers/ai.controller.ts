import { Request, Response } from "express";
import { parseUserQuery } from "../services/openai.service";
import { searchProperties } from "../repositories/property.repository";

export async function aiSearch(req: Request, res: Response) {
  const { message } = req.body;

  const filters = await parseUserQuery(message);
  const properties = await searchProperties(filters);

  res.json({
    filters,
    properties,
  });
}
