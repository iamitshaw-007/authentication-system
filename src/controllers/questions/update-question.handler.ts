import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import updateQuestionSchemaObject from "./joi-data-validator/update-question-schema-object.joi.js";

export async function updateQuestionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = updateQuestionSchemaObject.validate(
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
                    errorDetails: error.details.map(
                        (errorDetail) => errorDetail.message
                    ),
                }
            );
        } else {
            const client = await pool.connect();
            const { questionId } = request.params;
            try {
                await client.query("BEGIN");
                // step 1: update tags for question_tag_associations
                // a. delete tags which are no longer valid for questionId
                // b. insert tags which are newly added for questionId
                const existingTagsQueryResult: QueryResult = await client.query(
                    `SELECT question_tag_id FROM question_tag_associations 
                     WHERE question_id = $1`,
                    [questionId]
                );

                const existingTags = existingTagsQueryResult.rows.map(
                    (row) => row.question_tag_id
                );
                const tagsToInsertForQuestion = value.tags.filter(
                    (tagId: unknown) => !existingTags.includes(tagId)
                );
                const tagsToRemoveForQuestion = existingTags.filter(
                    (tagId: unknown) => !value.tags.includes(tagId)
                );

                if (tagsToInsertForQuestion.length > 0) {
                    const values = tagsToInsertForQuestion.map(
                        (_: unknown, index: number) =>
                            `($${index * 2 + 1} , $${index * 2 + 2})`
                    );
                    await client.query(
                        `INSERT INTO question_tag_associations 
                        (question_id, question_tag_id)
                        VALUES ${values.join(",")}`,
                        tagsToInsertForQuestion.flatMap((tagId: unknown) => [
                            questionId,
                            tagId,
                        ])
                    );
                }

                if (tagsToRemoveForQuestion.length > 0) {
                    winstonLoggerUtil.info("result", {
                        meta: tagsToRemoveForQuestion,
                    });
                    await client.query(
                        `DELETE FROM question_tag_associations 
                         WHERE question_id = $1 AND question_tag_id = ANY($2)`,
                        [questionId, tagsToRemoveForQuestion]
                    );
                }

                // step 2: update questions details
                await client.query(
                    `UPDATE questions
                    SET subjects_id = $1,
                        question_types_id = $2,
                        status = $3,
                        difficulty = $4,
                        topic = $5
                    WHERE id = $6`,
                    [
                        value.subjectsId,
                        value.questionTypesId,
                        value.status,
                        value.difficulty,
                        value.topic,
                        questionId,
                    ]
                );
                // Step 3: Update question_versions table for each version
                // a. Match existing question versions with payload versions by ID
                //      and update their information if a match is found
                // b. Delete existing question versions that do not have a matching ID
                //      in the payload (i.e., versions that are no longer needed)
                // c. Insert new question versions into the table if a payload version
                //      does not have a matching ID (i.e., a new version is being added)
                if (
                    Array.isArray(value.languageVersions) &&
                    value.languageVersions.length > 0
                ) {
                    const existingQuestionVersionsQuery = await client.query(
                        `SELECT question_id, question_version_id
                        FROM question_version_associations
                        WHERE question_id = $1`,
                        [questionId]
                    );

                    for (const version of value.languageVersions) {
                        const existingVersion =
                            existingQuestionVersionsQuery.rows.find(
                                (existingVersion) =>
                                    existingVersion.question_version_id ===
                                    version.id
                            );

                        if (existingVersion) {
                            await client.query(
                                `UPDATE question_versions
                                 SET
                                    languages_id = $1,
                                    question_text = $2,
                                    numeric_answer = $3,
                                    question_types_id = $4,
                                    multiple_choice_options = $5,
                                    multiple_choice_answer = $6,
                                    fill_in_the_blank_answer = $7,
                                    descriptive_answer = $8
                                 WHERE id = $9`,
                                [
                                    version.languagesId,
                                    version.questionText,
                                    version.numericAnswer,
                                    version.questionTypesId,
                                    version.multipleChoiceOptions,
                                    version.multipleChoiceAnswer,
                                    version.fillInTheBlankAnswer,
                                    version.descriptiveAnswer,
                                    version.id,
                                ]
                            );
                        } else {
                            const insertVersionQuery = await client.query(
                                `INSERT INTO question_versions
                                (languages_id, question_text, numeric_answer, question_types_id,
                                multiple_choice_options, multiple_choice_answer,
                                fill_in_the_blank_answer, descriptive_answer)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                RETURNING id`,
                                [
                                    version.languagesId,
                                    version.questionText,
                                    version.numericAnswer,
                                    version.questionTypesId,
                                    version.multipleChoiceOptions,
                                    version.multipleChoiceAnswer,
                                    version.fillInTheBlankAnswer,
                                    version.descriptiveAnswer,
                                ]
                            );

                            const newVersionId = insertVersionQuery.rows[0].id;
                            await client.query(
                                `INSERT INTO question_version_associations
                                (question_id, question_version_id)
                                VALUES ($1, $2)`,
                                [questionId, newVersionId]
                            );
                        }
                    }

                    for (const existingVersion of existingQuestionVersionsQuery.rows) {
                        const versionInPayload = value.languageVersions.find(
                            (version: { id: unknown }) =>
                                version.id ===
                                existingVersion.question_version_id
                        );
                        if (!versionInPayload) {
                            await client.query(
                                `DELETE FROM question_version_associations
                                WHERE question_id = $1 AND question_version_id = $2`,
                                [
                                    questionId,
                                    existingVersion.question_version_id,
                                ]
                            );
                            await client.query(
                                `DELETE FROM question_versions
                                WHERE id = $1`,
                                [existingVersion.question_version_id]
                            );
                        }
                    }
                }
                await client.query("COMMIT");
                winstonLoggerUtil.info("Calling Success Response Handler");
                successHttpResponseObjectUtil(request, response, 200, {
                    questionId: questionId,
                    message: "Question updated successfully",
                });
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Calling Error Response Generator");
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
        winstonLoggerUtil.info("Calling Error Response Generator");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
