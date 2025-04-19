import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import Joi from "joi";
import { QueryResult } from "pg";

export async function createBlogPostHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            content: Joi.string().required(),
            blogPostState: Joi.string().valid("DRAFT", "PUBLISHED").required(),
            status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
            blogTags: Joi.array().items(Joi.string().uuid()).required().min(1),
            blogCourses: Joi.array()
                .items(
                    Joi.object({
                        courseId: Joi.string().uuid().required(),
                        blogSubjects: Joi.array().items(
                            Joi.string().uuid().required().min(1)
                        ),
                    })
                )
                .required()
                .min(1)
                .unique("courseId"),
        }).validate(request.body, {
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
            const client = await pool.connect();
            try {
                // step 1: insert into blog_posts
                const result: QueryResult = await client.query(
                    `
                    INSERT INTO blog_posts (
                        title, 
                        description,
                        content, 
                        status, 
                        blog_post_state
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                    `,
                    [
                        value.title,
                        value.description,
                        value.content,
                        value.status,
                        value.blogPostState,
                    ]
                );
                const blogPostId = result.rows[0].id;
                // step 2: insert into blog_tag_associations
                await client.query(
                    `INSERT INTO blog_tag_associations (
                        blog_post_id, 
                        blog_tag_id
                    )
                    VALUES ${value.blogTags
                        .map(
                            (_: string, index: number) =>
                                `($${index * 2 + 1}, 
                                $${index * 2 + 2})`
                        )
                        .join(", ")}`,
                    value.blogTags.flatMap((tag: string) => [blogPostId, tag])
                );
                // step 3: insert into blog_post_courses
                const blogCoursesSubjects = value.blogCourses.flatMap(
                    ({
                        courseId,
                        blogSubjects,
                    }: {
                        courseId: string;
                        blogSubjects: string[];
                    }) =>
                        blogSubjects.map((subjectId: string) => [
                            blogPostId,
                            courseId,
                            subjectId,
                        ])
                );
                await client.query(
                    `INSERT INTO blog_post_courses (
                        blog_post_id, 
                        course_id,
                        subject_id
                    )
                    VALUES ${blogCoursesSubjects
                        .map(
                            (_: [string, string, string], index: number) =>
                                `($${index * 3 + 1}, 
                                $${index * 3 + 2},
                                $${index * 3 + 3})`
                        )
                        .join(", ")}`,
                    blogCoursesSubjects.flatMap(
                        ([blogPostId, courseId, subjectId]: [
                            string,
                            string,
                            string,
                        ]) => [blogPostId, courseId, subjectId]
                    )
                );
                await client.query("COMMIT");
                winstonLoggerUtil.info("Blog Post Created Successfully");
                successHttpResponseObjectUtil(request, response, 201, {
                    blogPostId: blogPostId,
                    message: "Blog Post Created Successfully",
                });
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Error Creating Blog Post: Rollback");
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
        winstonLoggerUtil.info("Error Creating Blog Posts");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
