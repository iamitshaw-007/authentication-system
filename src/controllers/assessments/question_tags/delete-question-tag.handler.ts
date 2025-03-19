import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";

export async function deleteQuestionTagHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const { questionTagId } = request.params;
        await pool.query(`DELETE FROM question_tags WHERE id = $1`, [
            questionTagId,
        ]);
        winstonLoggerUtil.info("Question Tag Deleted Successfully", {
            meta: {
                deletedQuestionTagId: questionTagId,
            },
        });
        successHttpResponseObjectUtil(request, response, 200, {
            deletedQuestionTagId: questionTagId,
            message: "Question Tag Deleted Successfully",
        });
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For QuestionTags");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
