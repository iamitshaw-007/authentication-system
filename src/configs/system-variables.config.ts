import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { winstonLoggerUtil } from "../utils/winston-logger.util.js";

/* Obtain System Environment */
const nodeInstance = process.env.NODE_ENV;
const instanceFilePath = path.resolve(
    path.dirname(import.meta.dirname),
    `../.env.${nodeInstance}`
);

try {
    if (fs.existsSync(instanceFilePath)) {
        dotenv.configDotenv({
            path: instanceFilePath,
        });
    }
} catch (error) {
    winstonLoggerUtil.error(error);
    process.exit(1);
}

export default {
    SYSTEM_ENVIRONMENT: process.env.SYSTEM_ENVIRONMENT?.toLowerCase(),
    PORT: Number(process.env.PORT),
    DATABASE_PORT: Number(process.env.DATABASE_PORT),
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_USER: process.env.DATABASE_USER,
};
