WITH exam_version_sections_expression AS (
    SELECT 
        exam_version_sections.id,
        exam_version_sections.exam_version_id,
        exam_version_sections.section_name
    FROM 
        exam_version_sections 
    WHERE 
        exam_version_sections.exam_version_id = 'b408f72f-439c-4a43-be21-94abbd35a3ad'
),
exam_version_section_questions_expression AS (
    SELECT 
        exam_version_section_questions.id,
        exam_version_section_questions.exam_version_section_id,
        exam_version_section_questions.question_id,
        exam_version_section_questions.marks
    FROM
        exam_version_sections_expression 
    JOIN exam_version_section_questions ON
        exam_version_sections_expression.id = exam_version_section_questions.exam_version_section_id
),
questions_details AS (
    SELECT 
        questions.id,
        COALESCE(
            json_agg(
                json_build_object(
                    'questionText', question_versions.question_text,
                    'languageName', languages.display_name,
                    'questionVersionId', question_versions.id
                )
            ),
            '[]'::json
        ) AS question_versions
    FROM
        exam_version_section_questions_expression
    JOIN questions ON 
        exam_version_section_questions_expression.question_id = questions.id
    JOIN question_version_associations ON
        question_version_associations.question_id = questions.id
    JOIN question_versions ON 
        question_versions.id = question_version_associations.question_version_id
    JOIN languages ON
        languages.id = question_versions.language_id
    GROUP BY
        questions.id
), exam_version_section_questions_table AS (
    SELECT
        exam_version_section_questions_expression.id,
        exam_version_section_questions_expression.question_id,
        exam_version_section_questions_expression.exam_version_section_id,
        questions_details.question_versions,
        exam_version_section_questions_expression.marks
    FROM
        exam_version_section_questions_expression
    JOIN questions_details ON
        questions_details.id = exam_version_section_questions_expression.question_id
), exam_version_question_list AS (
    SELECT
        exam_version_sections_expression.id ,
        exam_version_sections_expression.section_name,
        exam_version_sections_expression.exam_version_id,
        COALESCE(
            json_agg(
                json_build_object(
                    'questionVersions', exam_version_section_questions_table.question_versions,
                    'examVersionSectionQuestionId', exam_version_section_questions_table.id,
                    'examVersionSectionId', exam_version_section_questions_table.exam_version_section_id,
                    'questionId', exam_version_section_questions_table.question_id,
                    'marks', exam_version_section_questions_table.marks
                )
            ),
            '[]'::json
        ) AS question_info
    FROM
        exam_version_sections_expression
    JOIN exam_version_section_questions_table ON
        exam_version_section_questions_table.exam_version_section_id = exam_version_sections_expression.id
    GROUP BY
        exam_version_sections_expression.id,
        exam_version_sections_expression.section_name,
        exam_version_sections_expression.exam_version_id
), exam_version_sections_list AS (
    SELECT 
        exam_versions.id,
        COALESCE(
            json_agg(
                json_build_object(
                    'questions', exam_version_question_list.question_info,
                    'examVersionSectionName', exam_version_question_list.section_name,
                    'examVersionId', exam_version_question_list.exam_version_id,
                    'examVersionSectionId', exam_version_question_list.id
                )
            ),
            '[]'::json
        ) AS sections
    FROM
        exam_versions
    JOIN exam_version_question_list ON 
        exam_version_question_list.exam_version_id = exam_versions.id
    GROUP BY
        exam_versions.id
),
exam_paper_set_section_question_list AS (
    SELECT
        exam_paper_set_section_questions.exam_paper_set_section_id,
        COALESCE(
            json_agg(
                json_build_object(
                    'examVersionSectionQuestionId', exam_paper_set_section_questions.exam_version_section_question_id,
                    'questionOrder', exam_paper_set_section_questions.question_order
                )
            ),
            '[]'::json
        ) AS questions
    FROM 
        exam_paper_set_section_questions
    JOIN exam_version_section_questions_expression ON
        exam_version_section_questions_expression.id = exam_paper_set_section_questions.exam_version_section_question_id
    GROUP BY
        exam_paper_set_section_questions.exam_paper_set_section_id
), exam_paper_set_section_table AS (
    SELECT 
        exam_paper_set_sections.id,
        exam_paper_set_sections.section_order,
        exam_paper_set_sections.exam_paper_set_id,
        exam_paper_set_sections.exam_version_section_id,
        exam_paper_set_section_question_list.questions
    FROM 
        exam_paper_set_sections
    JOIN exam_paper_set_section_question_list ON
        exam_paper_set_section_question_list.exam_paper_set_section_id = exam_paper_set_sections.id
), exam_paper_set_section_list AS (
    SELECT 
        exam_paper_sets.id,
        exam_paper_sets.exam_version_id,
        exam_paper_sets.paper_set_id,
        COALESCE(
            json_agg(
                json_build_object(
                    'questions', exam_paper_set_section_table.questions,
                    'sectionOrder', exam_paper_set_section_table.section_order,
                    'examVersionSectionId', exam_paper_set_section_table.exam_version_section_id,
                    'examPaperSetSectionId', exam_paper_set_section_table.id
                )
            ),
            '[]'::json
        ) AS sections
    FROM 
        exam_paper_sets
    JOIN exam_paper_set_section_table ON
        exam_paper_set_section_table.exam_paper_set_id = exam_paper_sets.id
    GROUP BY
        exam_paper_sets.id,
        exam_paper_sets.exam_version_id,
        exam_paper_sets.paper_set_id
), exam_paper_set_list AS (
    SELECT 
        exam_versions.id,
        COALESCE(
            json_agg(
                json_build_object(
                    'examPaperSetSections', exam_paper_set_section_list.sections,
                    'examPaperSetId', exam_paper_set_section_list.id,
                    'examPaperSet', paper_sets.name
                )
            ),
            '[]'::json
        ) AS exam_paper_sets
    FROM
        exam_versions
    JOIN exam_paper_set_section_list ON 
        exam_paper_set_section_list.exam_version_id = exam_versions.id
    JOIN paper_sets ON 
        paper_sets.id = exam_paper_set_section_list.paper_set_id
    GROUP BY
        exam_versions.id
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
    COALESCE(exam_version_sections_list.sections, '[]'::json) AS "examVersionSections",
    COALESCE(exam_paper_set_list.exam_paper_sets, '[]'::json) AS "examPaperSets"
FROM
    exam_versions
    JOIN exam_version_sections_list ON exam_versions.id = exam_version_sections_list.id
    JOIN exam_paper_set_list ON exam_paper_set_list.id = exam_versions.id
    JOIN languages ON languages.id = exam_versions.language_id
    JOIN courses ON courses.id = exam_versions.course_id
WHERE
    exam_versions.id = 'b408f72f-439c-4a43-be21-94abbd35a3ad';