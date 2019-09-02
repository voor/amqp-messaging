#!/usr/bin/env node

import amqp from "amqplib";
import crypto from "crypto";
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

const logger = new Logging({ level: LOG_LEVEL }).logger();

const url: amqp.Options.Connect = {
  hostname: RABBITMQ_HOST,
  password: RABBITMQ_PASSWORD,
  username: RABBITMQ_USER
};

const sendRandomLog: (channel: amqp.Channel) => void = async (
  channel: amqp.Channel
) => {
  const message = crypto.randomBytes(20).toString("hex");

  channel.publish(RABBITMQ_EXCHANGENAME, "", Buffer.from(message));
  logger.debug(`Sent message ${message}`);
};

const randomDuration = (max: number) =>
  Math.floor(Math.random() * Math.floor(max));

// tslint:disable-next-line: arrow-parens
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const connectAnd = async (connectOptions: amqp.Options.Connect) => {
  const conn = await amqp.connect(connectOptions);
  process.once("SIGINT", () => conn.close());
  try {
    const channel = await conn.createChannel();

    await channel.assertExchange(RABBITMQ_EXCHANGENAME, RABBITMQ_MESSAGETYPE, {
      durable: false
    });

    await (async () => {
      while (true) {
        await sendRandomLog(channel);
        await sleep(randomDuration(2000));
      }
    })();

    channel.close();
  } catch (err) {
    logger.error(err);
  } finally {
    conn.close();
  }
};

connectAnd(url);
