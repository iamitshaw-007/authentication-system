import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function deleteQuestionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = Joi.object({
            questionId: Joi.string().uuid().required(),
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
            const client = await pool.connect();
            try {
                // check whether question exists
                const existingQuestionQueryResult: QueryResult =
                    await client.query(
                        `SELECT id FROM questions 
                        WHERE id = $1`,
                        [value.questionId]
                    );

                if (existingQuestionQueryResult.rows.length > 0) {
                    await client.query("BEGIN");
                    // step 1: delete tags_id from question_tag_associations
                    await client.query(
                        `DELETE FROM question_tag_associations 
                        WHERE question_id = $1`,
                        [value.questionId]
                    );

                    // step 2: delete version_id from question_version_associations
                    const result: QueryResult = await client.query(
                        `DELETE FROM question_version_associations 
                        WHERE question_id = $1 
                        RETURNING question_version_id`,
                        [value.questionId]
                    );

                    // step 3: delete version from question_versions
                    if (result.rows.length > 0) {
                        const questionVersionIds = result.rows.map(
                            (row) => row.question_version_id
                        );
                        await client.query(
                            `DELETE FROM question_versions 
                            WHERE id = ANY($1)`,
                            [questionVersionIds]
                        );
                    }

                    // step 4: delete question from questions
                    await client.query("DELETE FROM questions WHERE id = $1", [
                        value.questionId,
                    ]);

                    await client.query("COMMIT");
                    winstonLoggerUtil.info("Question Deleted Successfully");
                    successHttpResponseObjectUtil(request, response, 200, {
                        questionId: value.questionId,
                        message: "Question Deleted Successfully",
                    });
                } else {
                    winstonLoggerUtil.info("Question Not Found");
                    errorHttpResponseObjectUtil(
                        new Error("Question Not Found"),
                        request,
                        response,
                        nextFunction,
                        404
                    );
                }
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Error Deleting Question: Rollback");
                errorHttpResponseObjectUtil(
                    error,
                    request,
                    response,
                    nextFunction
                );
            } finally {
                client.release();
            }
        }
    } catch (error) {
        winstonLoggerUtil.info("Error Deleting Question");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
