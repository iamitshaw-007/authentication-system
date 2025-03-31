import { Router } from "express";
import questionRouter from "./questions.route.js";
import subjectRouter from "./subjects.route.js";
import statesRouter from "./states.route.js";
import languagesRouter from "./languages.route.js";
import questionTagsRouter from "./question-tags.route.js";
import questionTypesRouter from "./question-types.route.js";
import coursesRouter from "./courses.route.js";
import examVersionRouter from "./exam-versions.route.js";

const assessmentRouter = Router();

assessmentRouter.use("/question", questionRouter);
assessmentRouter.use("/states", statesRouter);
assessmentRouter.use("/subjects", subjectRouter);
assessmentRouter.use("/languages", languagesRouter);
assessmentRouter.use("/questionTags", questionTagsRouter);
assessmentRouter.use("/questionTypes", questionTypesRouter);
assessmentRouter.use("/courses", coursesRouter);
assessmentRouter.use("/exam-version", examVersionRouter);

export default assessmentRouter;
