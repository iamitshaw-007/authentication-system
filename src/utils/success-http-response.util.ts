import { Request, Response } from "express";
import { ISuccessHttpResponse } from "../types/http-response/success-http-response.type.js";
import instanceVariable from "../configs/system-variables.config.js";
import { winstonLoggerUtil } from "./winston-logger.util.js";

/*
 * This function creates and sends a structured
 * success response object in an Express application.
 * It is used to standardize success responses across
 * the application by including relevant request data
 * in development environments and ensuring a consistent
 * response format.
 */
export function successHttpResponseObjectUtil(
    request: Request,
    response: Response,
    statusCode: number,
    data: unknown,
    message: string | undefined = "Success"
): void {
    /*
     * Construct the success response object conforming to the
     * ISuccessHttpResponse interface. Includes success status,
     * HTTP status code, data, message, and optionally request
     * details for development environments to aid debugging.
     */
    const successObject: ISuccessHttpResponse = {
        success: true,
        statusCode,
        data,
        message: message,
        request:
            instanceVariable.SYSTEM_ENVIRONMENT?.toUpperCase() === "DEVELOPMENT"
                ? {
                      /* ip: request?.ip,*/
                      method: request?.method,
                      url: request?.originalUrl,
                  }
                : undefined,
    };

    /*
     * Log the success response object to the console
     * for debugging purposes. This includes all meta
     * information contained within the successObject.
     */
    winstonLoggerUtil.info("Sending Success Response", { meta: successObject });

    /*
     * Send a JSON response with the success details.
     * The response status is set based on the provided
     * statusCode. This ensures that the client receives
     * a structured response with the appropriate HTTP
     * status code and success information.
     */
    response.status(statusCode).json(successObject);
}
