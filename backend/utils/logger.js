import winston from "winston";
const { timestamp, colorize, printf, combine } = winston.format;
import path from "path";

/**
 * error,
 * warn,
 * info,
 * http,
 * verbose,
 * debug,
 * silly
 */

export const logger = winston.createLogger({
  level: "silly",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});