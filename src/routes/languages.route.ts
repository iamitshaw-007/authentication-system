import { Router } from "express";
import { getLanguagesHandler } from "../controllers/assessments/languages/get-languages.handler.js";

const languagesRouter = Router();

languagesRouter.get("/", getLanguagesHandler);

export default languagesRouter;
