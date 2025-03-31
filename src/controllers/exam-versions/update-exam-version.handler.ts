import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import updateExamVersionSchemaObject from "./joi-data-validator/update-exam-version-schema-object.joi.js";

export async function updateExamVersionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = updateExamVersionSchemaObject.validate(
            request.body,
            {
                abortEarly: false,
            }
        );
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
            const { examVersionId } = request.params;
            try {
                // check whether exam version exists
                const existingExamVersionQueryResult: QueryResult =
                    await client.query(
                        `SELECT id FROM exam_versions 
                        WHERE id = $1`,
                        [examVersionId]
                    );

                if (existingExamVersionQueryResult.rows.length > 0) {
                    await client.query("BEGIN");
                    // step 1: update exam_version details
                    await client.query(
                        `UPDATE exam_versions
                        SET exam_instructions = $1,
                            language_id = $2,
                            status = $3,
                            course_id = $4,
                            passing_score = $5,
                            total_score = $6,
                            exam_version_name = $7,
                            has_resource_booklet = $8,
                            resource_booklet_information = $9,
                            has_question_sets = $10,
                            has_sections = $11
                        WHERE id = $12`,
                        [
                            value.examInstructions,
                            value.languageId,
                            value.status,
                            value.courseId,
                            value.passingScore,
                            value.totalScore,
                            value.examVersionName,
                            value.hasResourseBooklet,
                            value.resourseBookletInformation,
                            value.hasQuestionSets,
                            value.hasSections,
                            examVersionId,
                        ]
                    );
                    // Step 2: Update exam_paper_sets table for each exam_paper_set of ${examVersionId}
                    // a. Update existing exam_paper_set if payload value of
                    //      questionPaperSetId exists in exam_paper_sets
                    // b. Delete existing exam_paper_set from exam_paper_sets
                    //     if questionPaperSetId isn't present in payload
                    // c. Insert new exam_paper_set if payload value of
                    //      questionPaperSetId doesn't exists in exam_paper_sets
                    if (
                        Array.isArray(value.examPaperSets) &&
                        value.examPaperSets.length > 0
                    ) {
                        const existingExamPaperSetsQueryResult =
                            await client.query(
                                `SELECT exam_version_id, paper_set_id
                                FROM exam_paper_sets
                                WHERE exam_version_id = $1`,
                                [examVersionId]
                            );
                        const existingExamPaperSets =
                            existingExamPaperSetsQueryResult.rows.map(
                                (existingExamPaperSet) => ({
                                    examVersionId:
                                        existingExamPaperSet.exam_version_id,
                                    paperSetId:
                                        existingExamPaperSet.paper_set_id,
                                })
                            );
                        for (const examPaperSet of value.examPaperSets) {
                            const doesExamPaperSetExists =
                                existingExamPaperSets.find(
                                    (existingExamPapaerSet) =>
                                        existingExamPapaerSet.paperSetId ===
                                        examPaperSet.questionPaperSetId
                                );

                            if (doesExamPaperSetExists) {
                                await client.query(
                                    `UPDATE question_versions
                                    SET
                                        language_id = $1,
                                        question_text = $2,
                                        numeric_answer = $3,
                                        question_type_id = $4,
                                        multiple_choice_options = $5,
                                        multiple_choice_answer = $6,
                                        fill_in_the_blank_answer = $7,
                                        descriptive_answer = $8
                                    WHERE id = $9`,
                                    [
                                        examPaperSet.languageId,
                                        examPaperSet.questionText,
                                        examPaperSet.numericAnswer,
                                        examPaperSet.questionTypeId,
                                        examPaperSet.multipleChoiceOptions,
                                        examPaperSet.multipleChoiceAnswer,
                                        examPaperSet.fillInTheBlankAnswer,
                                        examPaperSet.descriptiveAnswer,
                                        examPaperSet.id,
                                    ]
                                );
                            } else {
                                const insertVersionQueryResult =
                                    await client.query(
                                        `INSERT INTO question_versions
                                    (language_id, question_text, numeric_answer, question_type_id,
                                    multiple_choice_options, multiple_choice_answer,
                                    fill_in_the_blank_answer, descriptive_answer)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                    RETURNING id`,
                                        [
                                            examPaperSet.languageId,
                                            examPaperSet.questionText,
                                            examPaperSet.numericAnswer,
                                            examPaperSet.questionTypeId,
                                            examPaperSet.multipleChoiceOptions,
                                            examPaperSet.multipleChoiceAnswer,
                                            examPaperSet.fillInTheBlankAnswer,
                                            examPaperSet.descriptiveAnswer,
                                        ]
                                    );

                                const newVersionId =
                                    insertVersionQueryResult.rows[0].id;
                                await client.query(
                                    `INSERT INTO question_version_associations
                                    (question_id, question_version_id)
                                    VALUES ($1, $2)`,
                                    [examVersionId, newVersionId]
                                );
                            }
                        }

                        // for (const {
                        //     examVersionId,
                        //     paperSetId,
                        // } of existingExamPaperSets) {
                        //     const versionInPayload =
                        //         value.questionVersions.find(
                        //             (version: { id: unknown }) =>
                        //                 version.id === questionVersionId
                        //         );
                        //     if (!versionInPayload) {
                        //         await client.query(
                        //             `DELETE FROM question_version_associations
                        //             WHERE question_id = $1 AND question_version_id = $2`,
                        //             [questionId, questionVersionId]
                        //         );
                        //         await client.query(
                        //             `DELETE FROM question_versions
                        //             WHERE id = $1`,
                        //             [questionVersionId]
                        //         );
                        //     }
                        // }
                    }
                    await client.query("COMMIT");
                    winstonLoggerUtil.info("Question Updated Successfully");
                    successHttpResponseObjectUtil(request, response, 200, {
                        questionId: examVersionId,
                        message: "Question Updated Successfully",
                    });
                } else {
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
                winstonLoggerUtil.info("Error Updating Question: Rollback");
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
        winstonLoggerUtil.info("Error Updating Question");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
