#!/usr/bin/env node

import amqp from "amqplib";
import crypto from "crypto";
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
const sentCounter = new client.Counter({
  help: "number of sent messages",
  name: "sent_messages"
});

const sendRandomLog: (channel: amqp.Channel) => void = async (
  channel: amqp.Channel
) => {
  const message = crypto.randomBytes(20).toString("hex");

  channel.publish(RABBITMQ_EXCHANGENAME, "", Buffer.from(message));
  sentCounter.inc();
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
