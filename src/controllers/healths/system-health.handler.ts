import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import os from "os";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";

export function systemHealthHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const systemHealthObject = {
            timeStamp: Date.now(),
            cpuUsage: os.loadavg(),
            totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(0)} MB`,
            freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(0)} MB`,
        };
        winstonLoggerUtil.info("Calling Success Response Handler");
        successHttpResponseObjectUtil(
            request,
            response,
            200,
            systemHealthObject
        );
    } catch (error) {
        winstonLoggerUtil.info("Calling Error Response Generator");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
