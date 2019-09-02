import amqp, { ConsumeMessage } from "amqplib";
import dotenv from "dotenv";
import client from "prom-client";
import logger from "./logging";
import Metrics from "./metrics";

dotenv.config();

const {
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

const metrics = new Metrics();
const received = new client.Counter({
  help: "number of received messages",
  name: "received_messages"
});

const outputLog: (message: ConsumeMessage) => void = message => {
  logger.debug(`Received: ${message.content.toString()}`);
  received.inc(); // Inc with 1
};

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
