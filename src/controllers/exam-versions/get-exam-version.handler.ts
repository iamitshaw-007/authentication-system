import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";

export async function listExamVersionsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const { examVersionId } = request.params;
        const examVersionsGetQueryResult: QueryResult = await pool.query(
            `WITH sections_with_questions AS (
                SELECT
                    qs.id AS section_id,
                    qs.name,
                    qs.section_order,
                    qs.question_paper_set_id,
                    (
                        SELECT
                            COALESCE(
                                json_agg(
                                    json_build_object(
                                        'question_id', sqa.question_id,
                                        'question_order', sqa.question_order,
                                        'marks', sqa.marks
                                    )
                                    ORDER BY sqa.question_order
                                ),
                                '[]'::json
                            )
                        FROM
                            section_questions_associations sqa
                            JOIN exam_version_sections_associations evsa 
                                ON qs.id = evsa.question_section_id 
                                    AND evsa.exam_version_id = $1
                        WHERE
                            sqa.question_section_id = qs.id 
                    ) AS questions
                FROM
                    question_sections qs
            ),
            question_paper_sets AS (
                SELECT
                    qps.id AS question_paper_set_id,
                    qps.name AS question_paper_set_name,
                    evsa.exam_version_id,
                    json_agg(
                        json_build_object(
                            'question_section_name', qws.name,
                            'section_order', qws.section_order,
                            'questions', qws.questions
                        )
                        ORDER BY
                            qws.section_order
                    ) AS question_paper_sets
                FROM
                    question_paper_sets qps
                    JOIN sections_with_questions qws ON qps.id = qws.question_paper_set_id
                    JOIN question_sections qs ON qs.id = qws.section_id
                    JOIN exam_version_sections_associations evsa ON qs.id = evsa.question_section_id
                WHERE
                    evsa.exam_version_id = $1
                GROUP BY
                    qps.id,
                    qps.name,
                    evsa.exam_version_id
            ),
            exam_sets AS (
                SELECT
                    qs2.exam_version_id,
                    json_agg(
                        json_build_object(
                            'question_paper_set_name', qs2.question_paper_set_name,
                            'question_paper_sets', qs2.question_paper_sets
                        )
                    ) AS exam_sets
                FROM
                    question_paper_sets qs2
                WHERE 
                    qs2.exam_version_id = $1
                GROUP BY
                    qs2.exam_version_id
            )
            SELECT
                ev.id,
                ev.exam_instructions,
                ev.passing_score,
                ev.total_score,
                l.display_name AS languageName,
                c.title AS courseName,
                ev.exam_version_name,
                ev.has_resource_booklet,
                ev.resource_booklet_information,
                ev.has_sections,
                ev.status,
                ev.created_at,
                ev.updated_at,
                COALESCE(es.exam_sets, '[]'::json) AS exam_sets
            FROM
                exam_versions ev
                LEFT JOIN exam_sets es ON ev.id = es.exam_version_id
                JOIN languages l ON l.id = ev.languages_id
                JOIN courses c ON c.id = ev.course_id
            WHERE 
                ev.id = $1`,
            [examVersionId]
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
