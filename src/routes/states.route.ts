import { Router } from "express";
import { getStatesHandler } from "../controllers/assessments/states/get-states.handler.js";

const statesRouter = Router();

statesRouter.get("/", getStatesHandler);
export default statesRouter;
