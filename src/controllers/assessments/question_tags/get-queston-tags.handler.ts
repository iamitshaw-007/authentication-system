import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";

export async function getQuestionTagsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const questionTagsGetQueryResult: QueryResult = await pool.query(
            `SELECT * FROM question_tags`
        );
        winstonLoggerUtil.info("Success Response Handler For QuestionTags");
        successHttpResponseObjectUtil(request, response, 200, {
            questionTags: questionTagsGetQueryResult.rows,
            questionTagsCount: questionTagsGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For QuestionTags");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
