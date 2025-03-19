import { Router } from "express";
import { getQuestionTagsHandler } from "../controllers/assessments/question_tags/get-queston-tags.handler.js";
import { createQuestionTagsHandler } from "../controllers/assessments/question_tags/create-question-tags.handler.js";
import { deleteQuestionTagHandler } from "../controllers/assessments/question_tags/delete-question-tag.handler.js";
import { updateQuestionTagsHandler } from "../controllers/assessments/question_tags/update-question-tags.handler.js";

const questionTagsRouter = Router();

questionTagsRouter.get("/", getQuestionTagsHandler);
questionTagsRouter.post("/", createQuestionTagsHandler);
questionTagsRouter.delete("/:questionTagId", deleteQuestionTagHandler);
questionTagsRouter.put("/", updateQuestionTagsHandler);

export default questionTagsRouter;
