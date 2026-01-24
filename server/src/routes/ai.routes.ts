import { Router } from "express";
import { aiSearch } from "../controllers/ai.controller";

const router = Router();

router.post("/search", aiSearch);

export default router;
