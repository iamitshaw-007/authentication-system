import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import Joi from "joi";
import { PoolClient, QueryResult } from "pg";

export async function updateBlogPostHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        /* validate request body */
        const { error, value } = Joi.object({
            blogPostId: Joi.string().uuid().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            content: Joi.string().optional(),
            blogPostState: Joi.string().valid("DRAFT", "PUBLISHED").optional(),
            status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
            blogTags: Joi.array().items(Joi.string().uuid()).optional().min(1),
            blogCourses: Joi.array()
                .items(
                    Joi.object({
                        courseId: Joi.string().uuid().required(),
                        blogSubjects: Joi.array().items(
                            Joi.string().uuid().required().min(1)
                        ),
                    })
                )
                .optional()
                .min(1)
                .unique("courseId"),
        }).validate(Object.assign({}, request.body, request.params), {
            abortEarly: false,
        });
        if (error) {
            errorHttpResponseObjectUtil(
                new Error("Request Body Validation Error"),
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
            const client: PoolClient = await pool.connect();
            try {
                // step 1: update blog_posts
                await client.query(
                    `UPDATE blog_posts 
                    SET
                        title = COALESCE($1, blog_posts.title), 
                        description = COALESCE($2, blog_posts.description),
                        content = COALESCE($3, blog_posts.content), 
                        status = COALESCE($4, blog_posts.status), 
                        blog_post_state = COALESCE($5, blog_posts.blog_post_state)
                    WHERE
                        id = $6
                    `,
                    [
                        value.title,
                        value.description,
                        value.content,
                        value.status,
                        value.blogPostState,
                        value.blogPostId,
                    ]
                );

                if (value.blogTags && value.blogTags.length > 0) {
                    // step 2: update blog_tags
                    const result: QueryResult = await client.query(
                        `SELECT blog_tag_id 
                        FROM blog_tag_associations 
                        WHERE blog_post_id = $1`,
                        [value.blogPostId]
                    );
                    const existingBlogTagsId = result.rows.map(
                        ({ blog_tag_id }: { blog_tag_id: string }) =>
                            blog_tag_id
                    );
                    const tagsToInsert = value.blogTags.filter(
                        (blogTagId: string) =>
                            !existingBlogTagsId.includes(blogTagId)
                    );
                    const tagsToRemove = existingBlogTagsId.filter(
                        (blogTagId: string) =>
                            !value.blogTags.includes(blogTagId)
                    );

                    if (tagsToInsert.length > 0) {
                        await client.query(
                            `INSERT INTO blog_tag_associations 
                            (blog_post_id, blog_tag_id)
                            VALUES ${tagsToInsert
                                .map(
                                    (_: unknown, index: number) =>
                                        `($${index * 2 + 1} , $${index * 2 + 2})`
                                )
                                .join(",")}`,
                            tagsToInsert.flatMap((blogTagId: unknown) => [
                                value.blogPostId,
                                blogTagId,
                            ])
                        );
                    }

                    if (tagsToRemove.length > 0) {
                        await client.query(
                            `DELETE FROM blog_tag_associations 
                            WHERE 
                                blog_post_id = $1 AND blog_tag_id = ANY($2)`,
                            [value.blogPostId, tagsToRemove]
                        );
                    }
                }

                if (value.blogCourses && value.blogCourses.length > 0) {
                    // step 3: update blog_post_courses
                    const result: QueryResult = await client.query(
                        `SELECT blog_post_id, course_id, subject_id
                        FROM blog_post_courses
                        WHERE blog_post_id = $1`,
                        [value.blogPostId]
                    );
                    const existingBlogCourses: [string, string, string][] =
                        result.rows.map(
                            ({
                                blog_post_id,
                                course_id,
                                subject_id,
                            }: {
                                blog_post_id: string;
                                course_id: string;
                                subject_id: string;
                            }) => [blog_post_id, course_id, subject_id]
                        );
                    const blogCourses: [string, string, string][] =
                        value.blogCourses.flatMap(
                            ({
                                courseId,
                                blogSubjects,
                            }: {
                                courseId: string;
                                blogSubjects: string[];
                            }) =>
                                blogSubjects.map((subjectId: string) => [
                                    value.blogPostId,
                                    courseId,
                                    subjectId,
                                ])
                        );
                    const arrayEquals = <T>(a: T[], b: T[]): boolean => {
                        if (a.length !== b.length) {
                            return false;
                        }
                        return a.every(
                            (element, index) => element === b[index]
                        );
                    };

                    const subjectsToInsert = blogCourses.filter(
                        (item: [string, string, string]) =>
                            !existingBlogCourses.some((existingItem) =>
                                arrayEquals(existingItem, item)
                            )
                    );

                    const subjectsToRemove = existingBlogCourses.filter(
                        (item: [string, string, string]) =>
                            !blogCourses.some((newItem) =>
                                arrayEquals(newItem, item)
                            )
                    );
                    winstonLoggerUtil.info("value", {
                        meta: {
                            subjectsToInsert,
                            subjectsToRemove,
                            blogCourses,
                            existingBlogCourses,
                        },
                    });
                    if (subjectsToInsert.length > 0) {
                        await client.query(
                            `INSERT INTO blog_post_courses 
                            (blog_post_id, course_id, subject_id)
                            VALUES ${subjectsToInsert
                                .map(
                                    (
                                        _: [string, string, string],
                                        index: number
                                    ) =>
                                        `($${index * 3 + 1} , 
                                    $${index * 3 + 2}, 
                                    $${index * 3 + 3})`
                                )
                                .join(", ")}`,
                            subjectsToInsert.flatMap(
                                (item: [string, string, string]) => [
                                    item[0],
                                    item[1],
                                    item[2],
                                ]
                            )
                        );
                    }

                    if (subjectsToRemove.length > 0) {
                        await client.query(
                            `WITH course_subjects_to_delete AS (
                                SELECT blog_post_id::uuid, course_id::uuid, subject_id::uuid
                                FROM (VALUES
                                ${subjectsToRemove
                                    .map(
                                        (subject: [string, string, string]) =>
                                            `('${subject[0]}', 
                                            '${subject[1]}', 
                                            '${subject[2]}')`
                                    )
                                    .join(", ")}
                                ) AS temp_subjects (blog_post_id, course_id, subject_id)
                            ) DELETE FROM blog_post_courses 
                            WHERE blog_post_id = $1
                                AND (blog_post_courses.course_id, 
                                blog_post_courses.subject_id) IN (
                                    SELECT course_id, subject_id
                                    FROM course_subjects_to_delete
                                )`,
                            [value.blogPostId]
                        );
                    }
                }
                await client.query("COMMIT");
                winstonLoggerUtil.info("Blog Post Updated Successfully");
                successHttpResponseObjectUtil(request, response, 200, {
                    blogPostId: value.blogPostId,
                    message: "Blog Post Updated Successfully",
                });
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Error Updating Blog Post: Rollback");
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
        winstonLoggerUtil.info("Error Updating Blog Posts");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
