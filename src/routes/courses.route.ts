import { Router } from "express";
import { getCoursesHandler } from "../controllers/assessments/courses/get-courses.handler.js";

const coursesRouter = Router();

coursesRouter.get("/", getCoursesHandler);
export default coursesRouter;
