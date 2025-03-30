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
                        tagName: Joi.string().optional(),
                        tagCategory: Joi.string().optional(),
                        tagDescription: Joi.string().optional(),
                    })
                )
                .required()
                .unique("tagId")
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
                    errorDetails: error.details.map((errorDetail) =>
                        errorDetail.message.replace(/"([^"]*)"/g, "$1")
                    ),
                }
            );
        } else {
            const values = value.tags.map(
                (tagObject: {
                    tagId: unknown;
                    tagName: string;
                    tagCategory: string;
                    tagDescription: string;
                }) => [
                    tagObject.tagId,
                    tagObject.tagName,
                    tagObject.tagCategory,
                    tagObject.tagDescription,
                ]
            );

            await pool.query(
                `
                    WITH updated_tags AS (
                        SELECT tagId, tagName, tagCategory, tagDescription
                        FROM unnest($1::uuid[], $2::text[], $3::text[], $4::text[])
                        AS temp_tags (tagId, tagName, tagCategory, tagDescription)
                    )
                    UPDATE question_tags
                    SET question_tag = COALESCE(updated_tags.tagName, question_tags.question_tag),
                        category = COALESCE(updated_tags.tagCategory, question_tags.category),
                        description = COALESCE(updated_tags.tagDescription, question_tags.description)
                    FROM updated_tags
                    WHERE question_tags.id = updated_tags.tagId;
                `,
                [
                    ...values.reduce(
                        (
                            acc: unknown[][],
                            value: [unknown, string, string, string][]
                        ) => {
                            acc[0].push(value[0]);
                            acc[1].push(value[1]);
                            acc[2].push(value[2]);
                            acc[3].push(value[3]);
                            return acc;
                        },
                        [[], [], [], []]
                    ),
                ]
            );

            winstonLoggerUtil.info("Question Tags Updated Successfully", {
                meta: {
                    tags: value.tags,
                },
            });
            successHttpResponseObjectUtil(request, response, 200, {
                message: "Question Tags Updated Successfully",
            });
        }
    } catch (error) {
        winstonLoggerUtil.info("Error Updating QuestionTags");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
