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
                    errorDetails: error.details.map((errorDetail) =>
                        errorDetail.message.replace(/"([^"]*)"/g, "$1")
                    ),
                }
            );
        } else {
            const client = await pool.connect();
            try {
                await client.query("BEGIN");
                // step 1: insert generic details into exam_versions
                const examVersionInsertQuery = `
                    INSERT INTO exam_versions (status, language_id, course_id, passing_score, 
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
                if (
                    Array.isArray(value.examSections) &&
                    value.examSections.length > 0
                ) {
                    // step 2: insert into exam_version_sections
                    const sectionDetailListInExamversion: {
                        sectionDisplayId: number;
                        sectionName: string;
                        examVersionId: string;
                    }[] = [];

                    value.examSections.forEach(
                        (examSection: {
                            sectionDisplayId: number;
                            sectionName: string;
                        }) =>
                            sectionDetailListInExamversion.push({
                                sectionDisplayId: examSection.sectionDisplayId,
                                sectionName: examSection.sectionName,
                                examVersionId,
                            })
                    );

                    const examVersionSectionsInsertQueryResult: QueryResult =
                        await client.query(
                            `
                                INSERT INTO exam_version_sections 
                                (section_display_id, section_name, exam_version_id)
                                VALUES ${sectionDetailListInExamversion
                                    .map(
                                        (
                                            _: {
                                                sectionDisplayId: number;
                                                sectionName: string;
                                                examVersionId: string;
                                            },
                                            index: number
                                        ) =>
                                            `($${index * 3 + 1}, 
                                            $${index * 3 + 2}, 
                                            $${index * 3 + 3})`
                                    )
                                    .join(", ")}
                                RETURNING id, section_display_id;
                            `,
                            sectionDetailListInExamversion.flatMap(
                                (sectionDetail: {
                                    sectionName: string;
                                    examVersionId: string;
                                    sectionDisplayId: number;
                                }) => [
                                    sectionDetail.sectionDisplayId,
                                    sectionDetail.sectionName,
                                    sectionDetail.examVersionId,
                                ]
                            )
                        );
                    const examVersionSectionObjectList: {
                        sectionDisplayId: number;
                        examVersionSectionId: string;
                    }[] = examVersionSectionsInsertQueryResult.rows.map(
                        (examVersionSection: {
                            id: string;
                            section_display_id: number;
                        }) => ({
                            sectionDisplayId:
                                examVersionSection.section_display_id,
                            examVersionSectionId: examVersionSection.id,
                        })
                    );

                    // step 3: insert into exam_version_section_questions
                    const questionDetailListInExamVersion: {
                        examVersionSectionId: string;
                        questionId: string;
                        marks: number;
                        questionDisplayId: number;
                    }[] = [];
                    value.examSections.forEach(
                        (
                            examSection: {
                                sectionDisplayId: number;
                                sectionName: string;
                                questions: {
                                    questionId: string;
                                    marks: number;
                                    questionDisplayId: number;
                                }[];
                            },
                            sectionIndex: number
                        ) =>
                            examSection.questions.forEach((question) => {
                                const examVersionSectionId =
                                    examVersionSectionObjectList[sectionIndex]
                                        .examVersionSectionId;
                                questionDetailListInExamVersion.push({
                                    questionId: question.questionId,
                                    marks: question.marks,
                                    examVersionSectionId,
                                    questionDisplayId:
                                        question.questionDisplayId,
                                });
                            })
                    );
                    const examVersionSectionQuestionsInsertQueryResult: QueryResult =
                        await client.query(
                            `
                                INSERT INTO exam_version_section_questions 
                                (question_id, marks, exam_version_section_id, question_display_id)
                                VALUES ${questionDetailListInExamVersion
                                    .map(
                                        (
                                            _: {
                                                examVersionSectionId: string;
                                                questionId: string;
                                                marks: number;
                                            },
                                            index: number
                                        ) =>
                                            `($${index * 4 + 1}, $${index * 4 + 2}, 
                                            $${index * 4 + 3}, $${index * 4 + 4})`
                                    )
                                    .join(", ")}
                                RETURNING id, question_display_id;
                            `,
                            questionDetailListInExamVersion.flatMap(
                                (questionDetail: {
                                    examVersionSectionId: string;
                                    questionId: string;
                                    marks: number;
                                    questionDisplayId: number;
                                }) => [
                                    questionDetail.questionId,
                                    questionDetail.marks,
                                    questionDetail.examVersionSectionId,
                                    questionDetail.questionDisplayId,
                                ]
                            )
                        );
                    const examVersionSectionQuestionObjectList: {
                        examVersionSectionQuestionId: string;
                        questionDisplayId: number;
                    }[] = examVersionSectionQuestionsInsertQueryResult.rows.map(
                        (examVersionSectionQuesion: {
                            id: string;
                            question_display_id: number;
                        }) => ({
                            examVersionSectionQuestionId:
                                examVersionSectionQuesion.id,
                            questionDisplayId:
                                examVersionSectionQuesion.question_display_id,
                        })
                    );
                    if (
                        Array.isArray(value.examPaperSets) &&
                        value.examPaperSets.length > 0
                    ) {
                        // step 4: insert into exam_paper_sets
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
                        const examPaperSetIds =
                            examPaperSetsInsertResult.rows.map(
                                (examPaperSet: { id: string }) =>
                                    examPaperSet.id
                            );

                        // step 5: insert into exam_paper_set_sections
                        const sectionDetailListInPaperSet: {
                            examVersionSectionId: string;
                            sectionDisplayId: number;
                            sectionOrder: number;
                            examPaperSetId: string;
                        }[] = [];
                        value.examPaperSets.forEach(
                            (
                                examPaperSet: {
                                    sections: {
                                        sectionDisplayId: number;
                                        sectionOrder: number;
                                        questions: {
                                            questionId: string;
                                            questionOrder: number;
                                            questionDisplayId: number;
                                        }[];
                                    }[];
                                },
                                paperSetIndex: number
                            ) => {
                                examPaperSet.sections.forEach((section) => {
                                    const examPaperSetId =
                                        examPaperSetIds[paperSetIndex];
                                    const examPaperSetSectionObject =
                                        examVersionSectionObjectList.find(
                                            (examVersionSectionObject) =>
                                                examVersionSectionObject.sectionDisplayId ===
                                                section.sectionDisplayId
                                        ) || {
                                            examVersionSectionId: "",
                                            sectionDisplayId: 0,
                                        };
                                    // Todo: if match isn't found, exit Exam Version creation
                                    sectionDetailListInPaperSet.push({
                                        examVersionSectionId:
                                            examPaperSetSectionObject.examVersionSectionId,
                                        sectionDisplayId:
                                            section.sectionDisplayId,
                                        sectionOrder: section.sectionOrder,
                                        examPaperSetId: examPaperSetId,
                                    });
                                });
                            }
                        );
                        const examPaperSetSectionsInsertQueryResult: QueryResult =
                            await client.query(
                                `
                                INSERT INTO exam_paper_set_sections 
                                (section_order, exam_paper_set_id, 
                                exam_version_section_id, section_display_id)
                                VALUES ${sectionDetailListInPaperSet
                                    .map(
                                        (
                                            _: {
                                                examVersionSectionId: string;
                                                sectionDisplayId: number;
                                                sectionOrder: number;
                                                examPaperSetId: string;
                                            },
                                            index: number
                                        ) =>
                                            `($${index * 4 + 1}, $${index * 4 + 2},
                                            $${index * 4 + 3}, $${index * 4 + 4})`
                                    )
                                    .join(", ")}
                                RETURNING id;
                            `,
                                sectionDetailListInPaperSet.flatMap(
                                    (sectionDetail: {
                                        examVersionSectionId: string;
                                        sectionOrder: number;
                                        sectionDisplayId: number;
                                        examPaperSetId: string;
                                    }) => [
                                        sectionDetail.sectionOrder,
                                        sectionDetail.examPaperSetId,
                                        sectionDetail.examVersionSectionId,
                                        sectionDetail.sectionDisplayId,
                                    ]
                                )
                            );
                        const examPaperSetSectionIds: string[] =
                            examPaperSetSectionsInsertQueryResult.rows.map(
                                (examPaperSetSection: { id: string }) =>
                                    examPaperSetSection.id
                            );
                        winstonLoggerUtil.info(
                            examPaperSetSectionsInsertQueryResult
                        );
                        // step 6: insert into exam_paper_set_section_questions
                        const questionDetailListInPaperSet: {
                            examPaperSetSectionId: string;
                            questionOrder: number;
                            questionDisplayId: number;
                            examPaperSetSectionQuestionId: string;
                        }[] = [];
                        let sectionIndex = 0;
                        value.examPaperSets.forEach(
                            (examPaperSet: {
                                sections: {
                                    sectionDisplayId: number;
                                    sectionOrder: number;
                                    questions: {
                                        questionId: string;
                                        questionOrder: number;
                                        questionDisplayId: number;
                                    }[];
                                }[];
                            }) => {
                                examPaperSet.sections.forEach((section) => {
                                    const examPaperSetSectionId =
                                        examPaperSetSectionIds[sectionIndex];
                                    section.questions.forEach((question) => {
                                        const examPaperSetSectionQuestionObject =
                                            examVersionSectionQuestionObjectList.find(
                                                (
                                                    examVersionSectionQuestionObject
                                                ) =>
                                                    examVersionSectionQuestionObject.questionDisplayId ===
                                                    question.questionDisplayId
                                            ) || {
                                                examVersionSectionQuestionId:
                                                    "",
                                                questionDisplayId: 0,
                                            };
                                        // Todo: if match isn't found, exit Exam Version creation
                                        questionDetailListInPaperSet.push({
                                            examPaperSetSectionId,
                                            questionOrder:
                                                question.questionOrder,
                                            questionDisplayId:
                                                question.questionDisplayId,
                                            examPaperSetSectionQuestionId:
                                                examPaperSetSectionQuestionObject.examVersionSectionQuestionId,
                                        });
                                    });
                                    sectionIndex += 1;
                                });
                            }
                        );
                        await client.query(
                            `
                            INSERT INTO exam_paper_set_section_questions 
                            (question_order, question_display_id, 
                            exam_paper_set_section_id, 
                            exam_version_section_question_id)
                            VALUES ${questionDetailListInPaperSet
                                .map(
                                    (
                                        _: {
                                            examPaperSetSectionId: string;
                                            questionOrder: number;
                                            questionDisplayId: number;
                                            examPaperSetSectionQuestionId: string;
                                        },
                                        index: number
                                    ) =>
                                        `($${index * 4 + 1}, $${index * 4 + 2}, 
                                        $${index * 4 + 3}, $${index * 4 + 4})`
                                )
                                .join(", ")}
                        `,
                            questionDetailListInPaperSet.flatMap(
                                (questionDetail: {
                                    examPaperSetSectionQuestionId: string;
                                    questionOrder: number;
                                    questionDisplayId: number;
                                    examPaperSetSectionId: string;
                                }) => [
                                    questionDetail.questionOrder,
                                    questionDetail.questionDisplayId,
                                    questionDetail.examPaperSetSectionId,
                                    questionDetail.examPaperSetSectionQuestionId,
                                ]
                            )
                        );
                    }
                }

                await client.query("COMMIT");
                winstonLoggerUtil.info("Exam Version Created Successfully");
                successHttpResponseObjectUtil(request, response, 201, {
                    questionId: examVersionId,
                    message: "Exam Version Created Successfully",
                });
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.error(
                    "Error Creating Exam Version: Rollback",
                    {
                        meta: { error },
                    }
                );
                winstonLoggerUtil.info("Error Creating Exam Version");
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
        winstonLoggerUtil.info("Error Creating Exam Version");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
