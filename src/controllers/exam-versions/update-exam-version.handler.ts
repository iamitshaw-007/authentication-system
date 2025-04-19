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
                        `SELECT * FROM exam_versions 
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

                    if (
                        Array.isArray(value.examSections) &&
                        value.examSections.length > 0
                    ) {
                        // step 2: update exam_version_sections details
                        const existingExamVersionSectionsQueryResult =
                            await client.query(
                                `SELECT id
                                FROM exam_version_sections
                                WHERE exam_version_id = $1`,
                                [examVersionId]
                            );
                        const existingExamVersionSections =
                            existingExamVersionSectionsQueryResult.rows.map(
                                (existingExamVersionSection) => ({
                                    examVersionSectionId:
                                        existingExamVersionSection.id,
                                })
                            );
                        for (const examVersionSectionInPayload of value.examSections) {
                            const doesExamVersionSectionExists =
                                existingExamVersionSections.find(
                                    (existingExamVersionSection) =>
                                        existingExamVersionSection.examVersionSectionId ===
                                        examVersionSectionInPayload.id
                                );
                            if (!doesExamVersionSectionExists) {
                                // insert into exam_version_sections
                                const insertExamVersionSectionQueryResult =
                                    await client.query(
                                        `INSERT INTO exam_version_sections
                                        (exam_version_id, section_name, section_display_id)
                                        VALUES ($1, $2, $3)
                                        RETURNING id`,
                                        [
                                            examVersionId,
                                            examVersionSectionInPayload.sectionName,
                                            examVersionSectionInPayload.sectionDisplayId,
                                        ]
                                    );
                                const newExamVersionSectionId =
                                    insertExamVersionSectionQueryResult.rows[0]
                                        .id;

                                examVersionSectionInPayload.questions.forEach(
                                    async (questionInPayload: {
                                        questionId: string;
                                        questionDisplayId: number;
                                        marks: number;
                                    }) => {
                                        await client.query(
                                            `INSERT INTO exam_version_section_questions
                                            (question_id, question_display_id, marks, exam_version_section_id)
                                            VALUES ($1, $2, $3, $4)`,
                                            [
                                                questionInPayload.questionId,
                                                questionInPayload.questionDisplayId,
                                                questionInPayload.marks,
                                                newExamVersionSectionId,
                                            ]
                                        );
                                    }
                                );
                            } else {
                                await client.query(
                                    `UPDATE exam_version_sections
                                    SET
                                        section_name = $1,
                                        section_display_id = $2,
                                    WHERE id = $3`,
                                    [
                                        examVersionSectionInPayload.sectionName,
                                        examVersionSectionInPayload.sectionDisplayId,
                                        examVersionSectionInPayload.id,
                                    ]
                                );

                                const existingExamVersionSectionQuestionsQueryResult =
                                    await client.query(
                                        `SELECT id
                                        FROM exam_version_question_sections
                                        WHERE exam_version_section_id = $1`,
                                        [examVersionSectionInPayload.id]
                                    );
                                const existingExamVersionSectionQuestions =
                                    existingExamVersionSectionQuestionsQueryResult.rows.map(
                                        (
                                            existingExamVersionSectionQuestion
                                        ) => ({
                                            examVersionSectionQuestionId:
                                                existingExamVersionSectionQuestion.id,
                                        })
                                    );
                                examVersionSectionInPayload.questions.forEach(
                                    async (questionInPayload: {
                                        id: string | null;
                                        questionId: string;
                                        questionDisplayId: number;
                                        marks: number;
                                    }) => {
                                        const doesExamVersionSectionQuestionExists =
                                            existingExamVersionSectionQuestions.find(
                                                (
                                                    existingExamVersionSectionQuestion
                                                ) =>
                                                    existingExamVersionSectionQuestion.examVersionSectionQuestionId ===
                                                    questionInPayload.id
                                            );
                                        if (
                                            !doesExamVersionSectionQuestionExists
                                        ) {
                                            // insert into exam_version_section_questions
                                            await client.query(
                                                `INSERT INTO exam_version_section_questions
                                                (question_id, question_display_id, marks, exam_version_section_id)
                                                VALUES ($1, $2, $3, $4)`,
                                                [
                                                    questionInPayload.questionId,
                                                    questionInPayload.questionDisplayId,
                                                    questionInPayload.marks,
                                                    examVersionSectionInPayload.id,
                                                ]
                                            );
                                        } else {
                                            // update exam_version_section_questions
                                            await client.query(
                                                `
                                                UPDATE exam_version_section_questions
                                                SET
                                                    marks = $1, 
                                                    question_display_id = $2
                                                WHERE id = $3
                                                `,
                                                [
                                                    questionInPayload.marks,
                                                    questionInPayload.questionDisplayId,
                                                    questionInPayload.id,
                                                ]
                                            );
                                        }
                                    }
                                );
                                // delete from exam_version_section_questions
                                for (const {
                                    examVersionSectionQuestionId,
                                } of existingExamVersionSectionQuestions) {
                                    const versionInPayload =
                                        examVersionSectionInPayload.questions.find(
                                            (version: { id: unknown }) =>
                                                version.id ===
                                                examVersionSectionQuestionId
                                        );
                                    if (!versionInPayload) {
                                        await client.query(
                                            `DELETE FROM exam_paper_set_section_questions
                                            WHERE exam_version_section_question_id = $1`,
                                            [examVersionSectionQuestionId]
                                        );
                                        await client.query(
                                            `DELETE FROM exam_version_section_questions
                                            WHERE id = $1`,
                                            [examVersionSectionQuestionId]
                                        );
                                    }
                                }
                            }
                        }

                        // delete from exam_version_sections
                        for (const {
                            examVersionSectionId,
                        } of existingExamVersionSections) {
                            const versionInPayload = value.examSections.find(
                                (version: { id: unknown }) =>
                                    version.id === examVersionSectionId
                            );
                            if (!versionInPayload) {
                                await client.query(
                                    `DELETE FROM exam_paper_set_sections
                                    WHERE exam_version_section_id = $1`,
                                    [examVersionSectionId]
                                );
                                await client.query(
                                    `DELETE FROM exam_version_sections
                                    WHERE id = $1`,
                                    [examVersionSectionId]
                                );
                            }
                        }
                    }

                    if (
                        Array.isArray(value.examPaperSets) &&
                        value.examPaperSets.length > 0
                    ) {
                        // step 3: update exam_paper_sets details
                        const existingExamPaperSetsQueryResult =
                            await client.query(
                                `SELECT id
                                FROM exam_paper_sets
                                WHERE exam_version_id = $1`,
                                [examVersionId]
                            );
                        const existingExamPaperSets =
                            existingExamPaperSetsQueryResult.rows.map(
                                (existingExamPaperSet) => ({
                                    examPaperSetId: existingExamPaperSet.id,
                                })
                            );
                        for (const examPaperSetInPayload of value.examPaperSets) {
                            const doesExamPaperSetExists =
                                existingExamPaperSets.find(
                                    (existingExamPaperSet) =>
                                        existingExamPaperSet.examPaperSetId ===
                                        examPaperSetInPayload.examPaperSetId
                                );
                            if (!doesExamPaperSetExists) {
                                // insert into exam_paper_sets
                                const insertExamPaperSetQueryResult =
                                    await client.query(
                                        `INSERT INTO exam_paper_sets
                                        (exam_version_id, paper_set_id)
                                        VALUES ($1, $2)
                                        RETURNING id`,
                                        [
                                            examVersionId,
                                            examPaperSetInPayload.paperSetId,
                                        ]
                                    );
                                const newExamPaperSetId =
                                    insertExamPaperSetQueryResult.rows[0].id;

                                const existingExamVersionSectionsQueryResult =
                                    await client.query(
                                        `SELECT id, section_display_id
                                        FROM exam_version_sections
                                        WHERE exam_version_id = $1`,
                                        [examVersionId]
                                    );
                                const existingExamVersionSections =
                                    existingExamVersionSectionsQueryResult.rows.map(
                                        (existingExamVersionSection) => ({
                                            examVersionSectionId:
                                                existingExamVersionSection.id,
                                            examSectionDisplayId:
                                                existingExamVersionSection.section_display_id,
                                        })
                                    );

                                examPaperSetInPayload.sections.forEach(
                                    async (sectionInPayload: {
                                        sectionDisplayId: number;
                                        sectionOrder: number;
                                        questions: {
                                            questionOrder: number;
                                            questionDisplayId: number;
                                        }[];
                                    }) => {
                                        const examVersionSectionObject =
                                            existingExamVersionSections.find(
                                                (existingExamVersionSection) =>
                                                    existingExamVersionSection.examSectionDisplayId ===
                                                    sectionInPayload.sectionDisplayId
                                            );
                                        // TODO: if examVersionSectionObject is null, exiting version updation
                                        await client.query(
                                            `INSERT INTO exam_paper_set_sections
                                            (exam_version_section_id, section_display_id, section_order, exam_paper_set_id)
                                            VALUES ($1, $2, $3, $4) RETURNING id`,
                                            [
                                                examVersionSectionObject?.examVersionSectionId,
                                                sectionInPayload.sectionDisplayId,
                                                sectionInPayload.sectionOrder,
                                                newExamPaperSetId,
                                            ]
                                        );

                                        const existingExamVersionSectionQuestionsQueryResult: QueryResult =
                                            await client.query(
                                                `SELECT id, question_display_id
                                                FROM exam_version_section_questions
                                                WHERE exam_version_section_id = $1`,
                                                [
                                                    examVersionSectionObject?.examVersionSectionId,
                                                ]
                                            );
                                        const existingExamVersionSectionQuestions: {
                                            examVersionSectionQuestionId: string;
                                            examQuestionDisplayId: number;
                                        }[] =
                                            existingExamVersionSectionQuestionsQueryResult.rows.map(
                                                (
                                                    existingExamVersionSectionQuestion
                                                ) => ({
                                                    examVersionSectionQuestionId:
                                                        existingExamVersionSectionQuestion.id,
                                                    examQuestionDisplayId:
                                                        existingExamVersionSectionQuestion.question_display_id,
                                                })
                                            );
                                        sectionInPayload.questions.forEach(
                                            async (questionInPayload) => {
                                                const examVersionSectionQuestionObject:
                                                    | {
                                                          examVersionSectionQuestionId: string;
                                                          examQuestionDisplayId: number;
                                                      }
                                                    | undefined =
                                                    existingExamVersionSectionQuestions.find(
                                                        (
                                                            existingExamVersionSectionQuestion
                                                        ) =>
                                                            existingExamVersionSectionQuestion.examQuestionDisplayId ===
                                                            questionInPayload.questionDisplayId
                                                    );
                                                if (
                                                    !!examVersionSectionQuestionObject &&
                                                    examVersionSectionQuestionObject.examVersionSectionQuestionId
                                                ) {
                                                    // INSERT into exam_paper_set_section_questions
                                                    // TODO: if examVersionSectionQuestionObject is null, exiting version updation
                                                    await client.query(
                                                        `INSERT INTO exam_paper_set_section_questions
                                            (exam_version_section_question_id, question_display_id, question_order, exam_paper_set_id)
                                            VALUES ($1, $2, $3, $4)`,
                                                        [
                                                            examVersionSectionQuestionObject?.examVersionSectionQuestionId,
                                                            questionInPayload.questionDisplayId,
                                                            questionInPayload.questionOrder,
                                                            newExamPaperSetId,
                                                        ]
                                                    );
                                                }
                                            }
                                        );
                                    }
                                );
                            } else {
                                await client.query(
                                    `UPDATE exam_version_sections
                                    SET
                                        section_name = $1,
                                        section_display_id = $2,
                                    WHERE id = $3`,
                                    [
                                        examPaperSetInPayload.sectionName,
                                        examPaperSetInPayload.sectionDisplayId,
                                        examPaperSetInPayload.id,
                                    ]
                                );

                                const existingExamVersionSectionQuestionsQueryResult =
                                    await client.query(
                                        `SELECT id
                                        FROM exam_version_question_sections
                                        WHERE exam_version_section_id = $1`,
                                        [examPaperSetInPayload.id]
                                    );
                                const existingExamVersionSectionQuestions =
                                    existingExamVersionSectionQuestionsQueryResult.rows.map(
                                        (
                                            existingExamVersionSectionQuestion
                                        ) => ({
                                            examVersionSectionQuestionId:
                                                existingExamVersionSectionQuestion.id,
                                        })
                                    );
                                examPaperSetInPayload.questions.forEach(
                                    async (questionInPayload: {
                                        id: string | null;
                                        questionId: string;
                                        questionDisplayId: number;
                                        marks: number;
                                    }) => {
                                        const doesExamVersionSectionQuestionExists =
                                            existingExamVersionSectionQuestions.find(
                                                (
                                                    existingExamVersionSectionQuestion
                                                ) =>
                                                    existingExamVersionSectionQuestion.examVersionSectionQuestionId ===
                                                    questionInPayload.id
                                            );
                                        if (
                                            !doesExamVersionSectionQuestionExists
                                        ) {
                                            // insert into exam_version_section_questions
                                            await client.query(
                                                `INSERT INTO exam_version_section_questions
                                                (question_id, question_display_id, marks, exam_version_section_id)
                                                VALUES ($1, $2, $3, $4)`,
                                                [
                                                    questionInPayload.questionId,
                                                    questionInPayload.questionDisplayId,
                                                    questionInPayload.marks,
                                                    examPaperSetInPayload.id,
                                                ]
                                            );
                                        } else {
                                            // update exam_version_section_questions
                                            await client.query(
                                                `
                                                UPDATE exam_version_section_questions
                                                SET
                                                    marks = $1, 
                                                    question_display_id = $2
                                                WHERE id = $3
                                                `,
                                                [
                                                    questionInPayload.marks,
                                                    questionInPayload.questionDisplayId,
                                                    questionInPayload.id,
                                                ]
                                            );
                                        }
                                    }
                                );
                                // delete from exam_version_section_questions
                                for (const {
                                    examVersionSectionQuestionId,
                                } of existingExamVersionSectionQuestions) {
                                    const versionInPayload =
                                        examPaperSetInPayload.questions.find(
                                            (version: { id: unknown }) =>
                                                version.id ===
                                                examVersionSectionQuestionId
                                        );
                                    if (!versionInPayload) {
                                        await client.query(
                                            `DELETE FROM exam_paper_set_section_questions
                                            WHERE exam_version_section_question_id = $1`,
                                            [examVersionSectionQuestionId]
                                        );
                                        await client.query(
                                            `DELETE FROM exam_version_section_questions
                                            WHERE id = $1`,
                                            [examVersionSectionQuestionId]
                                        );
                                    }
                                }
                            }
                        }

                        // delete from exam_version_sections
                        for (const {
                            examPaperSetId: examVersionSectionId,
                        } of existingExamPaperSets) {
                            const versionInPayload = value.examSections.find(
                                (version: { id: unknown }) =>
                                    version.id === examVersionSectionId
                            );
                            if (!versionInPayload) {
                                await client.query(
                                    `DELETE FROM exam_paper_set_sections
                                    WHERE exam_version_section_id = $1`,
                                    [examVersionSectionId]
                                );
                                await client.query(
                                    `DELETE FROM exam_version_sections
                                    WHERE id = $1`,
                                    [examVersionSectionId]
                                );
                            }
                        }
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
