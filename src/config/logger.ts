import { createLogger, format, transports, transport } from "winston";

const { combine, timestamp, printf, json } = format;

// Define custom log format
const logFormat = combine(timestamp(), json());

// Define transports based on environment
const transportList: transport[] = [
    new transports.Console({
        format: combine(
            timestamp(),
            printf(({ level, message, timestamp, ...meta }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                    Object.keys(meta).length ? JSON.stringify(meta) : ""
                }`;
            })
        ),
    }),
];

if (process.env.NODE_ENV === "production") {
    transportList.push(
        new transports.File({ filename: "logs/error.log", level: "error" })
    );
} else {
    transportList.push(new transports.File({ filename: "logs/combined.log" }));
}

// Create Winston logger instance
export const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "error" : "info",
    format: logFormat,
    transports: transportList,
});
