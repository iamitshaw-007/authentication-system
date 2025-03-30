import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function getQuestionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    /* validate request body */
    const { error, value } = Joi.object({
        questionId: Joi.string().uuid().required(),
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
            const questionsGetQueryResult: QueryResult = await pool.query(
                `WITH QuestionVersions AS (
                SELECT 
                    question_version_associations.question_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'questionVersionId', question_versions.id,
                            'questionText', question_versions.question_text, 
                            'numericAnswer', question_versions.numeric_answer, 
                            'languageName', languages.display_name,
                            'questionType', question_types.question_type,
                            'multipleChoiceOptions', question_versions.multiple_choice_options,
                            'multipleChoiceAnswer', question_versions.multiple_choice_answer,
                            'fillInTheBlankAnswer', question_versions.fill_in_the_blank_answer,
                            'descriptiveAnswer', question_versions.descriptive_answer
                        )
                    ) as questionVersions
                FROM 
                    question_version_associations 
                JOIN question_versions ON
                    question_version_associations.question_version_id = question_versions.id
                JOIN languages ON
                    question_versions.language_id = languages.id
                JOIN question_types ON 
                    question_versions.question_type_id = question_types.id
                WHERE question_version_associations.question_id = $1
                GROUP BY 
                    question_version_associations.question_id
                ), QuestionTags AS (
                SELECT 
                    question_tag_associations.question_id,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'tagId', question_tags.id,
                            'tagName', question_tags.question_tag,
                            'tagCategory', question_tags.category
                        )
                    ) as questionTags
                FROM 
                    question_tag_associations 
                JOIN question_tags ON 
                    question_tag_associations.question_tag_id = question_tags.id
                WHERE question_tag_associations.question_id = $1
                GROUP BY 
                    question_tag_associations.question_id
                )
                SELECT 
                    questions.id AS "questionId",
                    questions.status, 
                    questions.difficulty, 
                    questions.topic, 
                    subjects.display_name AS "subjectName",
                    question_types.question_type AS "questionType",
                    QuestionVersions.questionVersions AS "questionVersions",
                    QuestionTags.questionTags AS "questionTags"
                FROM questions 
                JOIN subjects ON 
                    subjects.id = questions.subject_id
                JOIN question_types ON
                    question_types.id = questions.question_type_id
                JOIN QuestionVersions ON QuestionVersions.question_id = questions.id
                LEFT JOIN QuestionTags ON QuestionTags.question_id = questions.id
                WHERE questions.id = $1`,
                [value.questionId]
            );
            winstonLoggerUtil.info("Get Question Success");
            successHttpResponseObjectUtil(request, response, 200, {
                questions: questionsGetQueryResult.rows,
                questionsCount: questionsGetQueryResult.rowCount,
            });
        } catch (error) {
            winstonLoggerUtil.info("Get Question Error");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        }
    }
}
