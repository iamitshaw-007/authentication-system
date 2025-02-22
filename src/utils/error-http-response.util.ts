import { NextFunction, Request, Response } from "express";
import { IErrorHttpResponse } from "../types/error-object/error-http-response.type.js";
import instanceVariable from "../configs/system-variables.config.js";
import { responseMessage } from "../constants/response-message.constant.js";
import { winstonLoggerUtil } from "./winston-logger.util.js";

/*
 * This function creates an error response object
 * and passes it to the next middleware in the Express
 * request-response cycle. It's useful for handling errors
 * and formatting them consistently across the application.
 */
export function errorHttpResponseObjectUtil(
    error: Error | unknown,
    request: Request,
    _: Response,
    nextFunction: NextFunction,
    statusCode: number = 500,
    data: unknown = null
): void {
    winstonLoggerUtil.error("Generating Error Object");

    /*
     * Declare variables to store request and trace information.
     * These are populated only in the development environment
     * to aid debugging without exposing sensitive information
     * in production.
     */
    let requestObject, traceObject;
    if (instanceVariable.SYSTEM_ENVIRONMENT?.toUpperCase() === "DEVELOPMENT") {
        requestObject = {
            /* ip: request?.ip, */
            method: request?.method,
            url: request?.originalUrl,
        };
        traceObject = error instanceof Error ? { errorStack: error.stack } : {};
    }

    /*
     * Construct the error object conforming to the
     * IErrorHttpResponse interface. Includes information
     * about the error, request details, and trace data.
     * The error message falls back to a generic response
     * if unavailable.
     */
    const errorObject: IErrorHttpResponse = {
        success: false,
        statusCode,
        data,
        message:
            error instanceof Error
                ? error.message || responseMessage.SOMETHING_WENT_WRONG
                : responseMessage.SOMETHING_WENT_WRONG,
        request: requestObject,
        trace: traceObject,
    };

    /*
     * Pass the error object to the next middleware using
     * nextFunction. This allows centralized error handling
     * by custom error handlers further down the middleware
     * chain.
     */
    nextFunction(errorObject);
}
