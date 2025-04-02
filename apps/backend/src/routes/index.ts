import { Application, Router } from "express";
import { notFoundHandler } from "../middleware/error.middleware";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import atmRouter from "./atm.routes";
import ticketRouter from "./ticket.routes";
import maintenanceRouter from "./maintenance.routes";
import slaRouter from "./sla.routes";

export const setupRoutes = (app: Application) => {
  // API Version prefix
  const API_PREFIX = "/api/v1";

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/users`, userRouter);
  app.use(`${API_PREFIX}/atms`, atmRouter);
  app.use(`${API_PREFIX}/tickets`, ticketRouter);
  app.use(`${API_PREFIX}/maintenance`, maintenanceRouter);
  app.use(`${API_PREFIX}/sla`, slaRouter);

  // Handle 404 routes
  app.use(notFoundHandler);
};
