import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function getExamVersionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
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
        try {
            const examVersionsGetQueryResult: QueryResult = await pool.query(
                `WITH 
                    sectionsWithQuestions AS (
                        SELECT 
                            question_sections.id AS section_id,
                            question_sections.section_name,
                            question_sections.section_order,
                            COALESCE(
                                json_agg(
                                    json_build_object(
                                        'questionId', section_question_associations.question_id,
                                        'questionOrder', section_question_associations.question_order,
                                        'marks', section_question_associations.marks
                                    )
                                    ORDER BY section_question_associations.question_order
                                ),
                                '[]'::json
                            ) AS questions
                        FROM 
                            question_sections
                            JOIN section_question_associations ON section_question_associations.question_section_id = question_sections.id
                        WHERE 
                            question_sections.id IN (
                                SELECT 
                                    paper_set_section_associations.question_section_id
                                FROM 
                                    paper_set_section_associations 
                                WHERE 
                                    paper_set_section_associations.exam_paper_set_id IN (
                                        SELECT 
                                            exam_paper_sets.id
                                        FROM 
                                            exam_paper_sets 
                                        WHERE 
                                            exam_paper_sets.exam_version_id = $1
                                    )
                            )
                        GROUP BY 
                            question_sections.id, 
                            question_sections.section_name, 
                            question_sections.section_order
                    ),
                    QuestionSets AS (
                        SELECT 
                            exam_paper_sets.id AS exam_paper_set_id,
                            paper_sets.name AS exam_paper_set_name,
                            json_agg(
                                json_build_object(
                                    'sectionId', sectionsWithQuestions.section_id,
                                    'sectionName', sectionsWithQuestions.section_name,
                                    'sectionOrder', sectionsWithQuestions.section_order,
                                    'questions', sectionsWithQuestions.questions
                                )
                                ORDER BY 
                                    sectionsWithQuestions.section_order
                            ) AS QuestionSets
                        FROM 
                            paper_set_section_associations
                            JOIN exam_paper_sets ON exam_paper_sets.id = paper_set_section_associations.exam_paper_set_id
                            JOIN paper_sets ON paper_sets.id = exam_paper_sets.paper_set_id
                            JOIN sectionsWithQuestions ON sectionsWithQuestions.section_id = paper_set_section_associations.question_section_id
                        WHERE 
                            exam_paper_sets.exam_version_id = $1
                        GROUP BY 
                            exam_paper_sets.id,
                            paper_sets.name
                    ), 
                    ExamPaperSets AS (
                        SELECT 
                            exam_paper_sets.exam_version_id,
                            json_agg(
                                json_build_object(
                                    'examPaperSet', QuestionSets.exam_paper_set_name,
                                    'sections', QuestionSets.QuestionSets
                                )
                            ) AS ExamPaperSets
                        FROM 
                            exam_paper_sets
                            JOIN QuestionSets ON exam_paper_sets.id = QuestionSets.exam_paper_set_id
                        WHERE 
                            exam_paper_sets.exam_version_id = $1
                        GROUP BY 
                            exam_paper_sets.exam_version_id
                    )
                SELECT 
                    exam_versions.id AS "examVersionId",
                    exam_versions.exam_instructions AS "examInstructions",
                    exam_versions.passing_score AS "passingScore",
                    exam_versions.total_score AS "totalScore",
                    languages.display_name AS "languageName",
                    courses.display_name AS "courseName",
                    exam_versions.exam_version_name AS "examVersionName",
                    exam_versions.has_resource_booklet AS "hasResourseBooklet",
                    exam_versions.resource_booklet_information AS "resourseBookletInformation",
                    exam_versions.has_sections AS "hasSections",
                    exam_versions.status AS "examStatus",
                    exam_versions.created_at AS "createdAt",
                    exam_versions.updated_at AS "updatedAt",
                    COALESCE(ExamPaperSets.ExamPaperSets, '[]'::json) AS "examPaperSets"
                FROM 
                    exam_versions
                    LEFT JOIN ExamPaperSets ON exam_versions.id = ExamPaperSets.exam_version_id
                    JOIN languages ON languages.id = exam_versions.language_id
                    JOIN courses ON courses.id = exam_versions.course_id
                WHERE 
                    exam_versions.id = $1;`,
                [value.examVersionId]
            );
            winstonLoggerUtil.info("Calling Success Response Handler");
            successHttpResponseObjectUtil(request, response, 200, {
                examVersions: examVersionsGetQueryResult.rows,
                examVersionsCount: examVersionsGetQueryResult.rowCount,
            });
        } catch (error) {
            winstonLoggerUtil.info("Calling Error Response Generator");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        }
    }
}
