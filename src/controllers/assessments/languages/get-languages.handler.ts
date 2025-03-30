import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";

export async function getLanguagesHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const languagesGetQueryResult: QueryResult = await pool.query(
            `SELECT 
                languages.id AS "languageId",
                languages.language_name AS "languageType",
                languages.language_code AS "languageCode",
                languages.display_name AS "languageName"
            FROM languages`
        );
        winstonLoggerUtil.info("Success Response Handler For Languages");
        successHttpResponseObjectUtil(request, response, 200, {
            languages: languagesGetQueryResult.rows,
            languagesCount: languagesGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For Languages");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
