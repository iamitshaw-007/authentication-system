import pg from "pg";
const { Pool } = pg;

/* application specific environmentVariable */
import instanceVariable from "./system-variables.config.js";

const pool = new Pool({
    user: instanceVariable.DATABASE_USER,
    host: instanceVariable.DATABASE_HOST,
    database: instanceVariable.DATABASE_NAME,
    password: instanceVariable.DATABASE_PASSWORD,
    port: instanceVariable.DATABASE_PORT,
});

export default pool;
