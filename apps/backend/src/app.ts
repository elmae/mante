import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Create Express app
const app = express();

// Apply middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
