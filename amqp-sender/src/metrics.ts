import cluster from "cluster";
import dotenv from "dotenv";
import express from "express";
import prometheus from "prom-client";
import logger from "./logging";

dotenv.config();

const { SERVER_MANAGER_PORT } = process.env;

export default class Metrics {
  constructor() {
    const metrics = express();
    const register = prometheus.register;

    metrics.get("/info", (req: express.Request, res: express.Response) => {
      res.sendStatus(200);
    });

    metrics.get("/metrics", (req: express.Request, res: express.Response) => {
      res.set("Content-Type", register.contentType);
      res.end(register.metrics());
    });

    prometheus.collectDefaultMetrics();

    const server = metrics.listen(SERVER_MANAGER_PORT, () => {
      // @ts-ignore
      const port = server.address().port;
      logger.info(
        `server started on port ${port} metrics exposed on /metrics endpoint`
      );
    });
  }
}
