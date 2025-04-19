import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function getBlogPostHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    const { error, value } = Joi.object({
        blogPostId: Joi.string().required(),
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
            const blogPostsQuery = `
                WITH blog_specific_courses AS (
    SELECT
        blog_post_courses.blog_post_id,
        blog_post_courses.course_id,
        blog_post_courses.subject_id,
        courses.course_name,
        courses.display_name,
        courses.course_code
    FROM 
        courses
    JOIN 
        blog_post_courses ON blog_post_courses.course_id = courses.id
    WHERE
        blog_post_courses.blog_post_id = $1
    GROUP BY
        blog_post_courses.blog_post_id,
        blog_post_courses.course_id,
        blog_post_courses.subject_id,
        courses.course_name,
        courses.display_name,
        courses.course_code
), blog_specific_subjects AS (
    SELECT
        blog_specific_courses.course_name,
        blog_specific_courses.display_name,
        blog_specific_courses.course_code,
        blog_specific_courses.blog_post_id,
        blog_specific_courses.course_id,
        COALESCE(
            json_agg(
                json_build_object(
                    'subjectId', subjects.id,
                    'subjectDisplayName', subjects.display_name,
                    'subjectCode', subjects.subject_code
                )
            ),
            '[]'::json
        ) AS blog_subjects
    FROM
        subjects
    JOIN 
        blog_specific_courses ON 
            blog_specific_courses.course_id = subjects.course_id AND 
            blog_specific_courses.subject_id = subjects.id
    GROUP BY
        blog_specific_courses.course_name,
        blog_specific_courses.display_name,
        blog_specific_courses.course_code,
        blog_specific_courses.blog_post_id,
        blog_specific_courses.course_id
), blog_courses AS (
    SELECT
        blog_specific_subjects.blog_post_id,
        COALESCE(
            json_agg(
                json_build_object(
                    'courseName', blog_specific_subjects.course_name,
                    'displayName', blog_specific_subjects.display_name,
                    'courseCode', blog_specific_subjects.course_code,
                    'courseId', blog_specific_subjects.course_id,
                    'blogSubjects', blog_specific_subjects.blog_subjects
                )
            ),
            '[]'::json
        ) AS blog_courses
    FROM 
        blog_specific_subjects
    GROUP BY
        blog_specific_subjects.blog_post_id
),
blog_specific_tags AS (
    SELECT
        blog_tag_associations.blog_post_id,
        COALESCE(
            json_agg(
                json_build_object(
                    'tagId', blog_tags.id,
                    'blogTag', blog_tags.blog_tag,
                    'category', blog_tags.category,
                    'description', blog_tags.description
                )
            ),
            '[]'::json
        ) AS blog_tags
    FROM 
        blog_tags
    JOIN 
        blog_tag_associations ON blog_tag_associations.blog_tag_id = blog_tags.id
    WHERE
        blog_tag_associations.blog_post_id = $1    
    GROUP BY
        blog_tag_associations.blog_post_id
)
SELECT 
    blog_posts.id,
    blog_posts.display_id,
    blog_posts.title,
    blog_posts.description,
    blog_posts.content,
    blog_posts.blog_post_state,
    blog_posts.status,
    blog_posts.created_at,
    blog_posts.updated_at,
    COALESCE(blog_specific_tags.blog_tags, '[]'::json) AS "blogTags",
    COALESCE(blog_courses.blog_courses, '[]'::json) AS "blogCourses"
FROM
    blog_posts
JOIN
    blog_courses ON blog_courses.blog_post_id = blog_posts.id
JOIN
    blog_specific_tags ON blog_specific_tags.blog_post_id = blog_posts.id
WHERE
    blog_posts.id = $1
            `;
            const blogPostsGetQueryResult: QueryResult = await pool.query(
                blogPostsQuery,
                [value.blogPostId]
            );
            winstonLoggerUtil.info("Get BlogPosts Success");
            successHttpResponseObjectUtil(request, response, 200, {
                blogPosts: blogPostsGetQueryResult.rows,
                blogPostsCount: blogPostsGetQueryResult.rowCount,
            });
        } catch (error) {
            winstonLoggerUtil.info("Get QuestionTags Error");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        }
    }
}
