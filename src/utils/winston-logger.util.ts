import { inspect } from "util";
import winston, { format } from "winston";
import instanceVariable from "../configs/system-variables.config.js";
import {
    ConsoleTransportInstance,
    ConsoleTransportOptions,
    FileTransportInstance,
    FileTransportOptions,
} from "winston/lib/winston/transports";
import path from "path";

/*
 * Define a custom format for console log messages.
 * This format includes the log level, timestamp,
 * message, and optional meta information. Meta
 * information is pretty-printed with colors using
 * `util.inspect` for better readability.
 */
const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;
    const hasMetaInformation =
        meta instanceof Object && Object.keys(meta).length > 0;
    const formattedMeta = hasMetaInformation
        ? `\nMETA: ${inspect(meta, {
              showHidden: true,
              depth: null,
              colors: true,
          })}`
        : "";

    return `${level.toLocaleUpperCase()} [${timestamp}] ${message} ${formattedMeta}`;
});

/*
 * Define a custom format for file log messages.
 * The format includes the log level, timestamp,
 * message, and serialized meta information. If
 * meta contains errors, extract additional error
 * details such as name, message, and stack trace.
 */
const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;
    const hasMetaInformation =
        meta instanceof Object && Object.keys(meta).length > 0;
    let formattedMeta: string;
    if (hasMetaInformation) {
        const metaInfoObject: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(meta)) {
            if (value instanceof Error) {
                metaInfoObject[key] = {
                    name: value?.name,
                    message: value?.message,
                    trace: value?.stack,
                };
            } else {
                metaInfoObject[key] = value;
            }
        }
        formattedMeta = `\nMETA: ${JSON.stringify(metaInfoObject)}`;
    } else {
        formattedMeta = "";
    }
    return `${level.toLocaleUpperCase()} [${timestamp}] ${message} ${formattedMeta}`;
});

/*
 * A function to create a console logging
 * transport instance with provied options.
 */
function consoleTransport(
    options: ConsoleTransportOptions
): ConsoleTransportInstance {
    return new winston.transports.Console(options);
}

/*
 * A function to create a file logging
 * transport instance with provied options.
 */
function fileTransport(options: FileTransportOptions): FileTransportInstance {
    return new winston.transports.File(options);
}

/*
 * Define a custom format to ignore console logging
 * in production environments. If the environment is
 * production, the format returns false, effectively
 * silencing console logs.
 */
const ignoreLogging = format((info) =>
    instanceVariable.SYSTEM_ENVIRONMENT?.toUpperCase() === "PRODUCTION"
        ? false
        : info
);

/*
 * Create a Winston logger with both console and file
 * transports. The logger uses different formats and
 * settings for console and file logging.
 */
export const winstonLoggerUtil = winston.createLogger({
    defaultMeta: {
        meta: {},
    },
    transports: [
        /*
         * Console logging transport
         * Logs messages at the 'info' level and above using the
         * consoleLogFormat. Applies colorization and timestamps
         * to enhance readability. Logging is ignored in production
         * environments.
         */
        consoleTransport({
            level: "info",
            format: format.combine(
                ignoreLogging(),
                format.timestamp(),
                consoleLogFormat
            ),
        }),

        /*
         * File logging transport
         * Logs messages at the 'info' level and above using the
         * fileLogFormat. Log files are named based on the current
         * environment and stored in the 'logs' directory.
         */
        fileTransport({
            filename: path.resolve(
                path.dirname(import.meta.filename),
                `../../logs/${instanceVariable.SYSTEM_ENVIRONMENT}.log`
            ),
            level: "info",
            format: format.combine(format.timestamp(), fileLogFormat),
        }),
    ],
});
