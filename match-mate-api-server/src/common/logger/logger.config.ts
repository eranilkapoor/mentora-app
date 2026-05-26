import * as winston from 'winston';

const isProd = process.env.NODE_ENV === 'production';

const customFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    return `[${String(timestamp)}] ${String(level).toUpperCase()} -> ${String(message)} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  },
);

export const winstonConfig = {
  level: isProd ? 'info' : 'debug',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(), //  structured logs
  ),

  transports: [
    new winston.transports.Console({
      format: isProd
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize({ all: true }),
            customFormat,
          ),
    }),

    //  File logging (production)
    ...(isProd
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
};
