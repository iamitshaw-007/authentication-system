import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import Joi from "joi";

export async function deleteQuestionTagHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    const { error, value } = Joi.object({
        questionTagId: Joi.string().uuid().required(),
    }).validate(request.params, {
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
            await pool.query(`DELETE FROM question_tags WHERE id = $1`, [
                value.questionTagId,
            ]);
            winstonLoggerUtil.info("Question Tag Deleted Successfully", {
                meta: {
                    deletedQuestionTagId: value.questionTagId,
                },
            });
            successHttpResponseObjectUtil(request, response, 200, {
                deletedQuestionTagId: value.questionTagId,
                message: "Question Tag Deleted Successfully",
            });
        } catch (error) {
            winstonLoggerUtil.info("Error Deleting QuestionTags");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        }
    }
}
