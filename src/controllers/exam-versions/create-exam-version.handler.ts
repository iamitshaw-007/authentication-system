import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import createExamVersionSchemaObject from "./joi-data-validator/create-exam-version-schema-object.joi.js";

export async function createExamVersionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = createExamVersionSchemaObject.validate(
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
            try {
                await client.query("BEGIN");
                // step 1: insert generic details into exam_versions
                const examVersionInsertQuery = `
                    INSERT INTO exam_versions (status, languages_id, course_id, passing_score, 
                    total_score, exam_instructions, exam_version_name, has_resource_booklet, 
                    resource_booklet_information, has_paper_sets, has_sections)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id;
                `;
                const examVersionInsertResult: QueryResult = await client.query(
                    examVersionInsertQuery,
                    [
                        value.status,
                        value.languageId,
                        value.courseId,
                        value.passingScore,
                        value.totalScore,
                        value.examInstructions,
                        value.examVersionName,
                        value.hasResourseBooklet,
                        value.resourseBookletInformation,
                        value.hasPaperSets,
                        value.hasSections,
                    ]
                );
                const examVersionId = examVersionInsertResult.rows[0].id;

                // step 2: insert into exam_paper_sets
                if (
                    Array.isArray(value.examPaperSets) &&
                    value.examPaperSets.length > 0
                ) {
                    const examPaperSetsInsertResult: QueryResult =
                        await client.query(
                            `INSERT INTO exam_paper_sets 
                            (exam_version_id, paper_set_id) 
                            VALUES ${value.examPaperSets
                                .map(
                                    (_: unknown, index: number) =>
                                        `($${index * 2 + 1} , $${index * 2 + 2})`
                                )
                                .join(", ")}
                            RETURNING id;`,
                            value.examPaperSets.flatMap(
                                ({
                                    questionPaperSetId,
                                }: {
                                    questionPaperSetId: string;
                                }) => [examVersionId, questionPaperSetId]
                            )
                        );
                    const examPaperSetIds = examPaperSetsInsertResult.rows.map(
                        (examPaperSet: { id: string }) => examPaperSet.id
                    );

                    // step 3: insert into question_sections
                    const sectionDetailListInPaperSet: [
                        string,
                        number,
                        string,
                    ][] = [];
                    const questionDetailListInSection: [
                        string,
                        string,
                        number,
                        number,
                    ][] = [];

                    value.examPaperSets.forEach(
                        (
                            examPaperSet: {
                                sections: {
                                    sectionName: string;
                                    sectionOrder: number;
                                    questions: {
                                        questionId: string;
                                        questionOrder: number;
                                        marks: number;
                                    }[];
                                }[];
                            },
                            paperSetIndex: number
                        ) => {
                            examPaperSet.sections.forEach((section) => {
                                const examPaperSetId =
                                    examPaperSetIds[paperSetIndex];
                                sectionDetailListInPaperSet.push([
                                    section.sectionName,
                                    section.sectionOrder,
                                    examPaperSetId,
                                ]);
                            });
                        }
                    );
                    const questionSectionsInsertQueryResult: QueryResult =
                        await client.query(
                            `
                                INSERT INTO question_sections 
                                (section_name, section_order)
                                VALUES ${sectionDetailListInPaperSet
                                    .map(
                                        (
                                            _: [string, number, string],
                                            index: number
                                        ) =>
                                            `($${index * 3 + 1}, $${index * 3 + 2})`
                                    )
                                    .join(", ")}
                                RETURNING id;
                            `,
                            sectionDetailListInPaperSet.flat()
                        );
                    const questionSectionIds: string[] =
                        questionSectionsInsertQueryResult.rows.map(
                            (questionSection: { id: string }) =>
                                questionSection.id
                        );
                    const paperSetSectionDetailList: [string, string][] = [];
                    for (
                        let i = 0;
                        i < sectionDetailListInPaperSet.length;
                        i++
                    ) {
                        const examPaperSetId =
                            sectionDetailListInPaperSet[i][2];
                        paperSetSectionDetailList.push([
                            examPaperSetId,
                            questionSectionIds[i],
                        ]);
                    }
                    // step 4: insert into paper_set_section_association
                    await client.query(
                        `
                            INSERT INTO paper_set_section_association 
                            (question_section_id, exam_paper_set_id)
                            VALUES ${paperSetSectionDetailList
                                .map(
                                    (_: [string, string], index: number) =>
                                        `($${index * 2 + 1}, $${index * 2 + 2})`
                                )
                                .join(", ")}
                        `,
                        paperSetSectionDetailList.flat()
                    );
                    let sectionIndex = 0;
                    value.examPaperSets.forEach(
                        (examPaperSet: {
                            sections: {
                                sectionName: string;
                                sectionOrder: number;
                                questions: {
                                    questionId: string;
                                    questionOrder: number;
                                    marks: number;
                                }[];
                            }[];
                        }) => {
                            examPaperSet.sections.forEach((section) => {
                                const questionSectionId =
                                    questionSectionIds[sectionIndex];
                                section.questions.forEach((question) => {
                                    questionDetailListInSection.push([
                                        questionSectionId,
                                        question.questionId,
                                        question.questionOrder,
                                        question.marks,
                                    ]);
                                });
                                sectionIndex += 1;
                            });
                        }
                    );

                    // step 5: insert into section_questions_associations
                    await client.query(
                        `
                            INSERT INTO section_questions_associations 
                            (question_section_id, question_id, question_order, marks)
                            VALUES ${questionDetailListInSection
                                .map(
                                    (
                                        _: [string, string, number, number],
                                        index: number
                                    ) =>
                                        `($${index * 4 + 1}, $${index * 4 + 2}, 
                                        $${index * 4 + 3}, $${index * 4 + 4})`
                                )
                                .join(", ")}
                        `,
                        questionDetailListInSection.flat()
                    );
                }

                await client.query("COMMIT");
                winstonLoggerUtil.info("Calling Success Response Handler");
                successHttpResponseObjectUtil(request, response, 201, {
                    questionId: examVersionId,
                    message: "Exam version created successfully",
                });
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.error("Error creating exam version:", {
                    meta: { error },
                });
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
