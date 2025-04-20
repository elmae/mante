import { Format } from 'logform';
import { createLogger, format, transports } from 'winston';

const formatMetadata = format(info => {
  if (info.metadata && Object.keys(info.metadata).length > 0) {
    info.message = `${info.message} ${JSON.stringify(info.metadata)}`;
  }
  return info;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    formatMetadata(),
    format.colorize(),
    format.printf(
      info =>
        `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
    )
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json())
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(format.timestamp(), format.json())
    })
  ]
});

// Si no estamos en producción, también logueamos a la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  );
}

export const getLogger = (context: string) => {
  return {
    log: (message: string, ...args: any[]) => logger.info(`[${context}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => logger.error(`[${context}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => logger.warn(`[${context}] ${message}`, ...args),
    debug: (message: string, ...args: any[]) => logger.debug(`[${context}] ${message}`, ...args),
    verbose: (message: string, ...args: any[]) => logger.verbose(`[${context}] ${message}`, ...args)
  };
};

export default logger;
