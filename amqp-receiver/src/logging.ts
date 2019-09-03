import { createLogger, format, Logger, transports } from 'winston';
import { isMainThread } from 'worker_threads';

const { LOG_LEVEL } = process.env;

class Logging {
  private log: Logger;

  constructor() {
    this.log = createLogger({
      defaultMeta: { service: 'amqp-receiver' },
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [new transports.Console()]
    });
  }

  public logger(): Logger {
    return this.log;
  }
}

const logger = new Logging();
export default logger.logger();
