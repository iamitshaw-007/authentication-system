import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import Joi from "joi";

export async function createQuestionTagsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = Joi.object({
            tags: Joi.array().items(Joi.string()).unique().min(1).required(),
        }).validate(request.body, {
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
                    errorDetails: error.details.map(
                        (errorDetail) => errorDetail.message
                    ),
                }
            );
        } else {
            const values = value.tags
                .map((_: string, index: number) => `($${index + 1})`)
                .join(", ");
            await pool.query(
                `INSERT INTO question_tags (tag) 
                VALUES ${values}`,
                value.tags
            );
            winstonLoggerUtil.info("Question tags created successfully", {
                meta: {
                    tags: value.tags,
                },
            });
            successHttpResponseObjectUtil(request, response, 201, {
                message: "Question Tags Successfully Created",
            });
        }
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For QuestionTags");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
