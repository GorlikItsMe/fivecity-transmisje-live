import winston from "winston";
import util from "util";
const { combine, timestamp, printf, colorize, align, errors } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({
    format: "YYYY-MM-DD hh:mm:ss.SSS",
  }),
  align(),
  {
    transform: (info: winston.Logform.TransformableInfo, opts: any) => {
      // @ts-expect-error Dont mark as error info[Symbol.for("splat")]
      const args = info[Symbol.for("splat")];
      if (args) {
        info.message = util.format(info.message, ...args);
      }
      if (info.stack) {
        info.message = info.stack;
      }
      return info;
    },
  },
  printf((info) => {
    return `[${info.timestamp}] [${info.moduleName} / ${info.level}]: ${info.message}`;
  })
);

export function createLogger(moduleName: string): winston.Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { moduleName: moduleName },
    format: errors({ stack: true }),
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
        handleExceptions: true,
      }),
    ],
  });
}
