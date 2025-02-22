import { NextFunction, Request, Response } from "express";
import { responseMessage } from "../constants/response-message.constant.js";
import { errorHttpResponseObjectUtil } from "../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../utils/winston-logger.util.js";

/*
 * This function handles requests made to routes that
 * do not exist in the application. It logs the
 * "route not found" error and generates a structured
 * error response to be sent back to the client using
 * a utility function.
 */
export function routeNotFoundHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    const routeNotFound = responseMessage.NOT_FOUND("Route");
    try {
        /*
         * Log the "route not found" message to the console,
         * including meta information such as the original
         * URL of the request. This helps in debugging and
         * tracking which routes are being accessed that do
         * not exist.
         */
        winstonLoggerUtil.error(routeNotFound, {
            meta: {
                url: request.originalUrl,
            },
        });

        throw new Error(routeNotFound);
    } catch (error) {
        /*
         * Catch the thrown error and call the errorHttpResponseObjectUtil
         * function to generate a structured error response. This response
         * is then passed to the next middleware in the chain, typically a
         * global error handler.
         */
        winstonLoggerUtil.error("Calling Error Response Generator");
        errorHttpResponseObjectUtil(
            error,
            request,
            response,
            nextFunction,
            404
        );
    }
}
