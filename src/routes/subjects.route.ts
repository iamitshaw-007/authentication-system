import { Router } from "express";
import { getSubjectsHandler } from "../controllers/assessments/subjects/get-subjects.handler.js";

const subjectRouter = Router();

subjectRouter.get("/", getSubjectsHandler);

export default subjectRouter;
