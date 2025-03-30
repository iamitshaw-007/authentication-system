import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";

export async function getCoursesHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const coursesGetQueryResult: QueryResult = await pool.query(
            `SELECT 
                courses.id AS "courseId", 
                courses.course_name AS "courseType",
                courses.course_code AS "courseCode",
                courses.display_name AS "courseName"
            FROM courses`
        );
        winstonLoggerUtil.info("Get Courses Success");
        successHttpResponseObjectUtil(request, response, 200, {
            courses: coursesGetQueryResult.rows,
            coursesCount: coursesGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Get Courses Error");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
