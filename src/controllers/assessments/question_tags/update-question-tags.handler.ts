import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import Joi from "joi";

export async function updateQuestionTagsHandler(
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
                        tagId: Joi.string().uuid().required(),
                        tagName: Joi.string().required(),
                    })
                )
                .required()
                .unique("tagName")
                .min(1),
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
            value.tags.forEach(
                async (tagObject: { tagId: unknown; tagName: string }) => {
                    await pool.query(
                        `UPDATE question_tags
                        SET 
                            tag = $2
                        WHERE id = $1`,
                        [tagObject.tagId, tagObject.tagName]
                    );
                }
            );

            winstonLoggerUtil.info("Question tags updated successfully", {
                meta: {
                    tags: value.tags,
                },
            });
            successHttpResponseObjectUtil(request, response, 200, {
                message: "Question Tags Successfully Updated",
            });
        }
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For QuestionTags");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
