import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { apiRouter } from "./routes";

const app = express();

// Correct req.ip behind Railway's reverse proxy (needed for rate limiting and audit logs).
app.set("trust proxy", 1);

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API ready on http://localhost:${env.port}/api`);
});

export default app;
