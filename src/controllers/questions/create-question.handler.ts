import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import createQuestionSchemaObject from "./joi-data-validator/create-question-schema-object.joi.js";

export async function createQuestionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = createQuestionSchemaObject.validate(
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
            try {
                await client.query("BEGIN");
                // step 1: insert generic details into questions
                const questionInsertQuery = `
                    INSERT INTO questions (subject_id, difficulty, 
                    question_type_id, status, topic, course_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id;
                `;
                const questionResult: QueryResult = await client.query(
                    questionInsertQuery,
                    [
                        value.subjectId,
                        value.difficulty,
                        value.questionTypeId,
                        value.status,
                        value.topic,
                        value.courseId,
                    ]
                );
                const questionId = questionResult.rows[0].id;

                // step 2: insert into question_tags_associations
                if (Array.isArray(value.tags) && value.tags.length > 0) {
                    const values = value.tags.map(
                        (_: unknown, index: number) =>
                            `($${index * 2 + 1} , $${index * 2 + 2})`
                    );
                    await client.query(
                        `INSERT INTO question_tag_associations 
                        (question_id, question_tag_id) 
                        VALUES ${values.join(",")};`,
                        value.tags.flatMap((tagId: unknown) => [
                            questionId,
                            tagId,
                        ])
                    );
                }
                // step 3: insert into question_versions table for each version
                if (
                    Array.isArray(value.questionVersions) &&
                    value.questionVersions.length > 0
                ) {
                    const questionVersionsInsertQueryResult: QueryResult =
                        await client.query(
                            `INSERT INTO question_versions (language_id, 
                            question_text, descriptive_answer, fill_in_the_blank_answer, 
                            numeric_answer, multiple_choice_answer, 
                            multiple_choice_options, question_type_id) 
                            VALUES ${value.questionVersions
                                .map(
                                    (_: unknown, index: number) =>
                                        `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, 
                                    $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, 
                                    $${index * 8 + 7}, $${index * 8 + 8})`
                                )
                                .join(",")} RETURNING id, language_id;`,
                            value.questionVersions.flatMap(
                                (languageVersionObject: {
                                    languageId: unknown;
                                    questionText: string;
                                    descriptiveAnswer: string;
                                    fillInTheBlankAnswer: string;
                                    numericAnswer: number;
                                    multipleChoiceAnswer: string;
                                    multipleChoiceOptions: object;
                                    questionTypeId: unknown;
                                }) => [
                                    languageVersionObject.languageId,
                                    languageVersionObject.questionText,
                                    languageVersionObject.descriptiveAnswer,
                                    languageVersionObject.fillInTheBlankAnswer,
                                    languageVersionObject.numericAnswer,
                                    languageVersionObject.multipleChoiceAnswer,
                                    languageVersionObject.multipleChoiceOptions,
                                    languageVersionObject.questionTypeId,
                                ]
                            )
                        );
                    // step 4: insert into questin_version_associationss
                    await client.query(
                        `INSERT INTO question_version_associations
                        (question_id, question_version_id, language_id)
                        VALUES ${questionVersionsInsertQueryResult.rows
                            .map(
                                (_: unknown, index: number) =>
                                    `($${index * 3 + 1} , 
                                $${index * 3 + 2}, 
                                $${index * 3 + 3})`
                            )
                            .join(",")};`,
                        questionVersionsInsertQueryResult.rows.flatMap(
                            (versionObject: {
                                id: unknown;
                                language_id: unknown;
                            }) => [
                                questionId,
                                versionObject.id,
                                versionObject.language_id,
                            ]
                        )
                    );
                }
                await client.query("COMMIT");
                winstonLoggerUtil.info("Question Created Successfully");
                successHttpResponseObjectUtil(request, response, 201, {
                    questionId: questionId,
                    message: "Question Created Successfully",
                });
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Error Creating Question: Rollback");
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
        winstonLoggerUtil.info("Error Creating Question");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
