import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { analyticsRouter } from "./routes/analytics.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { driversRouter } from "./routes/drivers.js";
import { ordersRouter } from "./routes/orders.js";
import { reportsRouter } from "./routes/reports.js";
import { routesRouter } from "./routes/routes.js";
import { shipmentsRouter } from "./routes/shipments.js";
import { vehiclesRouter } from "./routes/vehicles.js";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "transport-logistics-api"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/shipments", shipmentsRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/routes", routesRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/catalog", catalogRouter);

app.use(notFound);
app.use(errorHandler);
