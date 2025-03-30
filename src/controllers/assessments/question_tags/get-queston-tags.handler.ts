import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function getQuestionTagsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    const { error, value } = Joi.object({
        category: Joi.string().optional().allow(""),
    }).validate(request.query, {
        abortEarly: false,
    });
    if (error) {
        errorHttpResponseObjectUtil(
            new Error("Validation Error"),
            request,
            response,
            nextFunction,
            400,
            {
                errorDetails: error.details.map((errorDetail) =>
                    errorDetail.message.replace(/"([^"]*)"/g, "$1")
                ),
            }
        );
    } else {
        try {
            let questionTagsQuery = `SELECT 
                    question_tags.id AS "questionTagId",
                    question_tags.question_tag AS "questionTagName",
                    question_tags.category AS "questionCategory",
                    question_tags.description AS "questionDescription"
                FROM question_tags `;
            let questionTagsParams = [];
            if (value.category) {
                questionTagsParams.push(value.category.split(","));
                questionTagsParams = questionTagsParams.flat();
                questionTagsQuery += `WHERE category IN (${questionTagsParams.map(
                    (_: string, index: number) => `$${index + 1}`
                )})`;
            }

            const questionTagsGetQueryResult: QueryResult = await pool.query(
                questionTagsQuery,
                questionTagsParams
            );
            winstonLoggerUtil.info("Get QuestionTags Success");
            successHttpResponseObjectUtil(request, response, 200, {
                questionTags: questionTagsGetQueryResult.rows,
                questionTagsCount: questionTagsGetQueryResult.rowCount,
            });
        } catch (error) {
            winstonLoggerUtil.info("Get QuestionTags Error");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        }
    }
}
