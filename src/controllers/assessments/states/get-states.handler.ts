import { NextFunction, Request, Response } from "express";
import { successHttpResponseObjectUtil } from "../../../utils/success-http-response.util.js";
import { errorHttpResponseObjectUtil } from "../../../utils/error-http-response.util.js";
import { winstonLoggerUtil } from "../../../utils/winston-logger.util.js";
import pool from "../../../configs/database.config.js";
import { QueryResult } from "pg";

export async function getStatesHandler(
    request: Request,
    response: Response,
    nextFunction: NextFunction
) {
    try {
        const statesGetQueryResult: QueryResult = await pool.query(
            `SELECT 
                states.id AS "stateId", 
                states.state AS "stateName" 
            FROM states`
        );
        winstonLoggerUtil.info("Success Response Handler For States");
        successHttpResponseObjectUtil(request, response, 200, {
            states: statesGetQueryResult.rows,
            statesCount: statesGetQueryResult.rowCount,
        });
    } catch (error) {
        winstonLoggerUtil.info("Error Response Generator For States");
        errorHttpResponseObjectUtil(error, request, response, nextFunction);
    }
}
