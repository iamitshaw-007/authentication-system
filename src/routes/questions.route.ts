import { Router } from "express";
import { createQuestionHandler } from "../controllers/questions/create-question.handler.js";
import { listQuestionsHandler } from "../controllers/questions/list-questions.handler.js";
import { getQuestionHandler } from "../controllers/questions/get-question.handler.js";
import { updateQuestionHandler } from "../controllers/questions/update-question.handler.js";
import { deleteQuestionHandler } from "../controllers/questions/delete-question.handler.js";
const questionRouter = Router();

/* create quesion */
questionRouter.post("/", createQuestionHandler);
/* list questions */
questionRouter.get("/", listQuestionsHandler);
/* get question with questionId */
questionRouter.get("/:questionId", getQuestionHandler);
/* update question */
questionRouter.put("/:questionId", updateQuestionHandler);
/* delete question */
questionRouter.delete("/:questionId", deleteQuestionHandler);

export default questionRouter;
