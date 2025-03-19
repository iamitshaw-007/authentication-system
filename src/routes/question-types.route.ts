import { Router } from "express";
import { getQuestionTypesHandler } from "../controllers/assessments/question_types/get-question-types.handler.js";

const questionTypesRouter = Router();

questionTypesRouter.get("/", getQuestionTypesHandler);

export default questionTypesRouter;
