import { createLogger, format, Logger, transports } from "winston";

export default class Logging {
  private log: Logger;

  constructor(environment: { level: string }) {
    this.log = createLogger({
      ...environment,
      defaultMeta: { service: "amqp-receiver" },
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [new transports.Console()]
    });
  }

  public logger() {
    return this.log;
  }
}
