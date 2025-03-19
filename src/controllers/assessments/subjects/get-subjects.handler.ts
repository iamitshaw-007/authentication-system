import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";

export async function getSubjectsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const subjectsGetQueryResult: QueryResult = await pool.query(
            `SELECT * FROM subjects`
        );
        winstonLoggerUtil.info("Success Response Handler For Subjects");
        successHttpResponseObjectUtil(request, response, 200, {
            subjects: subjectsGetQueryResult.rows,
            subjectsCount: subjectsGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For Subjects");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
