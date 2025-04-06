import winston from 'winston';
import config from './config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }),
  new winston.transports.File({ filename: 'logs/all.log' })
];

const Logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports
});

export function createLogger(context: string) {
  return {
    info: (message: string, ...meta: any[]) => Logger.info(`[${context}] ${message}`, ...meta),
    error: (message: string, ...meta: any[]) => Logger.error(`[${context}] ${message}`, ...meta),
    warn: (message: string, ...meta: any[]) => Logger.warn(`[${context}] ${message}`, ...meta),
    debug: (message: string, ...meta: any[]) => Logger.debug(`[${context}] ${message}`, ...meta),
    http: (message: string, ...meta: any[]) => Logger.http(`[${context}] ${message}`, ...meta)
  };
}

export default Logger;
