import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import Joi from "joi";
import { QueryResult } from "pg";

export async function deleteBlogPostHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const { error, value } = Joi.object({
            blogPostId: Joi.string().uuid().required(),
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
            const client = await pool.connect();
            try {
                // check whether blog_post exists
                const existingBlogPostQueryResult: QueryResult =
                    await client.query(
                        `SELECT id FROM blog_posts 
                        WHERE id = $1`,
                        [value.blogPostId]
                    );

                if (existingBlogPostQueryResult.rows.length > 0) {
                    await client.query("BEGIN");
                    // step 1: delete tags_id from blog_tag_associations
                    await client.query(
                        `DELETE FROM blog_tag_associations 
                        WHERE blog_post_id = $1`,
                        [value.blogPostId]
                    );

                    // step 2: delete blog_courses from blog_post_courses
                    await client.query(
                        `DELETE FROM blog_post_courses 
                        WHERE blog_post_id = $1`,
                        [value.blogPostId]
                    );

                    // step 4: delete blog_post from blog_posts
                    await client.query("DELETE FROM blog_posts WHERE id = $1", [
                        value.blogPostId,
                    ]);

                    await client.query("COMMIT");
                    winstonLoggerUtil.info("Blog Post Deleted Successfully");
                    successHttpResponseObjectUtil(request, response, 200, {
                        blogPostId: value.blogPostId,
                        message: "Blog Post Deleted Successfully",
                    });
                } else {
                    winstonLoggerUtil.info("Blog Post Not Found");
                    errorHttpResponseObjectUtil(
                        new Error("Blog Post Not Found"),
                        request,
                        response,
                        nextFunction,
                        404
                    );
                }
            } catch (error) {
                await client.query("ROLLBACK");
                winstonLoggerUtil.info("Error Deleting Blog Post: Rollback");
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
        winstonLoggerUtil.info("Error Deleting Blog Post");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
