/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { IErrorHttpResponse } from "../types/error-object/error-http-response.type.js";
import { winstonLoggerUtil } from "../utils/winston-logger.util.js";

/*
 * This function serves as a global error handler
 * for an Express application. It takes an error
 * object and sends a structured JSON response to
 * the client. The function is typically used as the
 * last middleware in the request-response cycle.
 */
export function globalErrorHandler(
    errorObject: IErrorHttpResponse,
    _request: Request,
    response: Response,
    _nextFunction: NextFunction
) {
    /*
     * Log the error object to the console for
     * debugging purposes. This includes any meta
     * information contained within the errorObject.
     */
    winstonLoggerUtil.info("Sending Error Response", { meta: errorObject });

    /*
     * Send a JSON response with the error details. The response
     * status is set based on the statusCode of the errorObject.
     * This ensures that the client receives a structured response
     * with the appropriate HTTP status code and error information.
     */
    response.status(errorObject.statusCode).json(errorObject);
}
