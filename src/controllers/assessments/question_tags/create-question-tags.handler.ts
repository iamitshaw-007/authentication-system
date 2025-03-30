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
            tags: Joi.array()
                .items(
                    Joi.object({
                        tag: Joi.string().required(),
                        description: Joi.string().optional().default(null),
                        category: Joi.string().optional().default(null),
                    })
                )
                .unique()
                .min(1)
                .required(),
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
                    errorDetails: error.details.map((errorDetail) =>
                        errorDetail.message.replace(/"([^"]*)"/g, "$1")
                    ),
                }
            );
        } else {
            await pool.query(
                `INSERT INTO question_tags 
                    (question_tag, category, description) 
                    VALUES ${value.tags
                        .map(
                            (
                                _: {
                                    tag: string;
                                    category: string;
                                    description: string;
                                },
                                index: number
                            ) =>
                                `($${index * 3 + 1}, 
                            $${index * 3 + 2}, 
                            $${index * 3 + 3})`
                        )
                        .join(", ")}`,
                value.tags.flatMap(
                    (tagObject: {
                        tag: string;
                        category: string;
                        description: string;
                    }) => [
                        tagObject.tag,
                        tagObject.category,
                        tagObject.description,
                    ]
                )
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
        winstonLoggerUtil.info("Error Creating QuestionTags");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
