import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import instanceVariable from "../../configs/system-variables.config.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";

export function applicationHealthHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const applicationHealthObject = {
            timeStamp: Date.now(),
            environment: instanceVariable.SYSTEM_ENVIRONMENT,
            uptime: `${process.uptime().toFixed(2)} seconds`,
            memoryUsage: {
                totalHeap: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(0)} MB`,
                freeHeap: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MB`,
            },
        };
        winstonLoggerUtil.info("Calling Success Response Handler");
        successHttpResponseObjectUtil(
            request,
            response,
            200,
            applicationHealthObject
        );
    } catch (error) {
        winstonLoggerUtil.info("Calling Error Response Generator");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
