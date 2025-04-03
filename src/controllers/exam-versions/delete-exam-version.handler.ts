import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function deleteExamVersionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = Joi.object({
            examVersionId: Joi.string().uuid().required(),
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
                        `SELECT id FROM exam_versions 
                        WHERE id = $1`,
                        [value.examVersionId]
                    );

                if (existingQuestionQueryResult.rows.length > 0) {
                    await client.query("BEGIN");
                    // step 1: delete from exam_paper_set_section_questions
                    await client.query(
                        `DELETE FROM exam_paper_set_section_questions 
                        WHERE exam_version_section_question_id IN (
                            SELECT id FROM exam_version_section_questions 
                            WHERE exam_version_section_id IN (
                                SELECT id FROM exam_version_sections 
                                WHERE exam_version_id = $1
                            )
                        )`,
                        [value.examVersionId]
                    );

                    // step 2: delete from exam_paper_set_sections
                    await client.query(
                        `DELETE FROM exam_paper_set_sections 
                        WHERE exam_version_section_id IN (
                            SELECT id FROM exam_version_sections 
                            WHERE exam_version_id = $1
                        )`,
                        [value.examVersionId]
                    );

                    // step 3: delete from exam_paper_sets
                    await client.query(
                        `DELETE FROM exam_paper_sets 
                        WHERE exam_version_id = $1`,
                        [value.examVersionId]
                    );

                    // step 4: delete from exam_version_section_questions
                    await client.query(
                        `DELETE FROM exam_version_section_questions 
                        WHERE exam_version_section_id IN (
                            SELECT id FROM exam_version_sections 
                            WHERE exam_version_id = $1
                        )`,
                        [value.examVersionId]
                    );

                    // step 5: delete from exam_version_sections
                    await client.query(
                        `DELETE FROM exam_version_sections 
                        WHERE exam_version_id = $1`,
                        [value.examVersionId]
                    );

                    // step 6: delete from exam_versions
                    await client.query(
                        `DELETE FROM exam_versions WHERE id = $1`,
                        [value.examVersionId]
                    );
                    await client.query("COMMIT");
                    winstonLoggerUtil.info("Exam Version Deleted Successfully");
                    successHttpResponseObjectUtil(request, response, 200, {
                        examVersionId: value.examVersionId,
                        message: "Exam Version Deleted Successfully",
                    });
                } else {
                    winstonLoggerUtil.info("Exam Version Not Found");
                    errorHttpResponseObjectUtil(
                        new Error("Exam Version Not Found"),
                        request,
                        response,
                        nextFunction,
                        404
                    );
                }
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Error Deleting Exam Version: Rollback");
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
        winstonLoggerUtil.info("Error Deleting Exam Version");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
