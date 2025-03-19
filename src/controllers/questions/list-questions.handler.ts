import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";

export async function listQuestionsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const questionsGetQueryResult: QueryResult = await pool.query(
            `WITH LanguageVersions AS (
                SELECT 
                    question_version_associations.question_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'version_id', question_versions.id,
                            'question_text', question_versions.question_text, 
                            'numeric_answer', question_versions.numeric_answer, 
                            'language', languages.name,
                            'question_type', question_types.type,
                            'multiple_choice_options', question_versions.multiple_choice_options,
                            'multiple_choice_answer', question_versions.multiple_choice_answer,
                            'fill_in_the_blank_answer', question_versions.fill_in_the_blank_answer,
                            'descriptive_answer', question_versions.descriptive_answer
                        )
                    ) as languageVersions
                FROM 
                    question_version_associations 
                JOIN question_versions ON
                    question_version_associations.question_version_id = question_versions.id
                JOIN languages ON
                    question_versions.languages_id = languages.id
                JOIN question_types ON 
                    question_versions.question_types_id = question_types.id
                GROUP BY 
                    question_version_associations.question_id
            ), QuestionTags AS (
                SELECT 
                    question_tag_associations.question_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', question_tags.id,
                            'tag', question_tags.tag
                        )
                    ) as questionTags
                FROM 
                    question_tag_associations 
                JOIN question_tags ON 
                    question_tag_associations.question_tag_id = question_tags.id
                GROUP BY 
                    question_tag_associations.question_id
            )
            SELECT 
                questions.id,
                questions.status, 
                questions.difficulty, 
                questions.topic, 
                subjects.subject,
                question_types.type,
                LanguageVersions.languageVersions,
                QuestionTags.questionTags
            FROM questions 
            JOIN subjects ON 
                subjects.id = questions.subjects_id
            JOIN question_types ON
                question_types.id = questions.question_types_id
            JOIN LanguageVersions ON LanguageVersions.question_id = questions.id
            LEFT JOIN QuestionTags ON QuestionTags.question_id = questions.id`
        );
        winstonLoggerUtil.info("Calling Success Response Handler");
        successHttpResponseObjectUtil(request, response, 200, {
            questions: questionsGetQueryResult.rows,
            questionsCount: questionsGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Calling Error Response Generator");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
