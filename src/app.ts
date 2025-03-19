import express, { Application } from "express";
import path from "path";
import { globalErrorHandler } from "./controllers/global-error.handler.js";
import { routeNotFoundHandler } from "./controllers/route-not-found.handler.js";
import healthsRouter from "./routes/healths.route.js";
import helmet from "helmet";
import cors from "cors";
import assessmentRouter from "./routes/assessment.route.js";

/*
 * Initialize an Express application instance.
 * The Application type from Express is used to
 * ensure correct typing for TypeScript users,
 * providing structure and IntelliSense support.
 */
const app: Application = express();

/* Third-party Middlewares */
app.use(helmet());
app.use(
    cors({
        credentials: true,
        methods: ["GET", "PUT", "POST", "DELETE"],
        optionsSuccessStatus: 204,
        origin: ["http://localhost"],
    })
);
/*
 * Middlewares
 *
 * - express.json(): Parses incoming requests with JSON payloads.
 *   Useful for APIs that accept JSON-formatted requests.
 *
 * - express.urlencoded(): Parses incoming requests with URL-encoded
 *   payloads. Supports extended syntax with nested objects, making it
 *   versatile for form submissions.
 *
 * - express.static(): Serves static files from the specified directory.
 *   In this case, it serves files from the 'public' directory.
 *   Static middleware is often used for serving HTML files, images, CSS
 *   and JavaScript.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    express.static(
        path.resolve(path.dirname(import.meta.filename), "../public")
    )
);

/*
 * Application Routes
 * Define application routes and attach route handlers.
 */

/*
 * - "/api/v1/healths": Attaches the healthsRoute handler to this path,
 *   organizing health-related routes under a versioned API path.
 */
app.use("/api/v1/healths", healthsRouter);
app.use("/api/v1/assessment", assessmentRouter);

/*
 * Route-Not-Found Handler Middleware
 *
 * This middleware handles all requests that do not match
 * any defined routes. It captures requests to non-existent
 * endpoints and triggers a custom handler, which logs the
 * error and generates a 404 response.
 */
app.use("*", routeNotFoundHandler);

/*
 * Global-Error-Handler Middleware
 *
 * This middleware processes errors that occur during
 * request handling. It provides a centralized error
 * handling mechanism, ensuring consistent error responses
 * and logging across the application.
 */
app.use("*", globalErrorHandler);

/*
 * Export the configured Express app instance.
 * This allows the app to be imported and used in other parts
 * of the application, such as the server setup file where it
 * is started on a specific port.
 */
export default app;
