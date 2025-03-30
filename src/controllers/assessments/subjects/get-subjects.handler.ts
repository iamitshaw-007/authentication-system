import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";
import Joi from "joi";

export async function getSubjectsHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    /* validate request body */
    const { error, value } = Joi.object({
        courseCode: Joi.string().required().min(2),
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
        try {
            const { courseCode } = value;
            const subjectsGetQueryResult: QueryResult = await pool.query(
                `SELECT
                    subjects.id AS "subjectId",
                    subjects.subject_code AS "subjectCode",
                    subjects.display_name AS "subjectName"
                FROM
                    subjects
                JOIN
                    courses ON courses.id = subjects.course_id
                WHERE
                    courses.course_code = $1`,
                [courseCode]
            );
            if (subjectsGetQueryResult.rowCount === 0) {
                successHttpResponseObjectUtil(
                    request,
                    response,
                    200,
                    {
                        subjects: subjectsGetQueryResult.rows,
                        subjectsCount: subjectsGetQueryResult.rowCount,
                    },
                    "No subjects found"
                );
            } else {
                winstonLoggerUtil.info("Success Response Handler For Subjects");
                successHttpResponseObjectUtil(request, response, 200, {
                    subjects: subjectsGetQueryResult.rows,
                    subjectsCount: subjectsGetQueryResult.rowCount,
                });
            }
        } catch (error) {
            winstonLoggerUtil.info("Error Response Generator For Subjects");
            errorHttpResponseObjectUtil(error, request, response, nextFunction);
        }
    }
}
