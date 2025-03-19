import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../utils/winston-logger.util.js";
import pool from "../../configs/database.config.js";
import { QueryResult } from "pg";

export async function deleteQuestionHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const { questionId } = request.params;
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            // step 1: delete tags_id from question_tag_associations
            await client.query(
                `DELETE FROM question_tag_associations 
                WHERE question_id = $1`,
                [questionId]
            );

            // step 2: delete version_id from question_version_associations
            const result: QueryResult = await client.query(
                `DELETE FROM question_version_associations 
                WHERE question_id = $1 RETURNING question_version_id`,
                [questionId]
            );

            // step 3: delete version from question_versions
            if (result.rows.length > 0) {
                const versionIds = result.rows.map(
                    (row) => row.question_version_id
                );
                await client.query(
                    `DELETE FROM question_versions 
                    WHERE id = ANY($1)`,
                    [versionIds]
                );
            }

            // step 4: delete question from questions
            await client.query("DELETE FROM questions WHERE id = $1", [
                questionId,
            ]);

            await client.query("COMMIT");
            winstonLoggerUtil.info("Calling Success Response Handler");
            successHttpResponseObjectUtil(request, response, 200, {
                questionId: questionId,
                message: "Question deleted successfully",
            });
        } catch (error) {
            await client.query("ROLLBACK");
            winstonLoggerUtil.info("Calling Error Response Generator");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        } finally {
            client.release();
        }
    } catch (error) {
        winstonLoggerUtil.info("Calling Error Response Generator");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
