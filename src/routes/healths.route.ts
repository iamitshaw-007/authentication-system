import { Router } from "express";
import { applicationHealthHandler } from "../controllers/healths/application-health.handler.js";
import { systemHealthHandler } from "../controllers/healths/system-health.handler.js";
const healthsRouter = Router();

/* list all users */
healthsRouter.route("/system").get(systemHealthHandler);
healthsRouter.route("/application").get(applicationHealthHandler);

export default healthsRouter;
