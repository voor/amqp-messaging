import amqp, { ConsumeMessage } from "amqplib";
import dotenv from "dotenv";
import Logging from "./logging";

dotenv.config();

const {
  LOG_LEVEL,
  RABBITMQ_EXCHANGENAME,
  RABBITMQ_HOST,
  RABBITMQ_MESSAGETYPE,
  RABBITMQ_PASSWORD,
  RABBITMQ_USER
} = process.env;

const url: amqp.Options.Connect = {
  hostname: RABBITMQ_HOST,
  password: RABBITMQ_PASSWORD,
  username: RABBITMQ_USER
};

const logger = new Logging({ level: LOG_LEVEL }).logger();

const outputLog: (message: ConsumeMessage) => void = message =>
  logger.debug(`Received: ${message.content.toString()}`);

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const connectAnd = async (connectOptions: amqp.Options.Connect) => {
  logger.debug("Connecting...");
  const conn = await amqp.connect(connectOptions);
  logger.debug("... Connection successful.");
  process.once("SIGINT", () => conn.close());
  try {
    const channel = await conn.createChannel();

    await channel.assertExchange(RABBITMQ_EXCHANGENAME, RABBITMQ_MESSAGETYPE, {
      durable: false
    });

    const queue = await channel.assertQueue("", { exclusive: true });

    await channel.bindQueue(queue.queue, RABBITMQ_EXCHANGENAME, "");

    await channel.consume(queue.queue, outputLog, { noAck: true });
    logger.info(
      `Connected successfully and awaiting messages on ${RABBITMQ_EXCHANGENAME}`
    );

    await (async () => {
      while (true) {
        await sleep(30000);
        logger.debug("Still waiting.");
      }
    })();
  } catch (err) {
    logger.error(err);
  } finally {
    conn.close();
  }
};

connectAnd(url);
