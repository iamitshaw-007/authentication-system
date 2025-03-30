import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";

export async function getQuestionTypesHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const questionTypesGetQueryResult: QueryResult = await pool.query(
            `SELECT 
                question_types.id AS "questionTypeId",
                question_types.question_type AS "questionType",
                question_types.display_name AS "questionName"
            FROM question_types`
        );
        winstonLoggerUtil.info("Get QuestionTypes Success");
        successHttpResponseObjectUtil(request, response, 200, {
            questionTypes: questionTypesGetQueryResult.rows,
            questionTypesCount: questionTypesGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Get QuestionTypes Error");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
