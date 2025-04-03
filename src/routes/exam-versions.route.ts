import { Router } from "express";
import { listExamVersionsHandler } from "../controllers/exam-versions/list-exam-versions.handler.js";
import { getExamVersionHandler } from "../controllers/exam-versions/get-exam-version.handler.js";
import { createExamVersionHandler } from "../controllers/exam-versions/create-exam-version.handler.js";
import { updateExamVersionHandler } from "../controllers/exam-versions/update-exam-version.handler.js";
import { deleteExamVersionHandler } from "../controllers/exam-versions/delete-exam-version.handler.js";

const examVersionRouter = Router();

/* list exam versions */
examVersionRouter.get("/", listExamVersionsHandler);
/* get exam version */
examVersionRouter.get("/:examVersionId", getExamVersionHandler);
/* create exam version */
examVersionRouter.post("/", createExamVersionHandler);
/* update exam version */
examVersionRouter.put("/:examVersionId", updateExamVersionHandler);
/* delete exam version */
examVersionRouter.delete("/:examVersionId", deleteExamVersionHandler);
export default examVersionRouter;
