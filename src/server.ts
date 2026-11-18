import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { apiRoutes } from "./routes/api.routes.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    const localDevelopmentOrigin = process.env.NODE_ENV !== "production"
      && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
    callback(null, !origin || allowedOrigins.includes(origin) || localDevelopmentOrigin);
  },
}));
app.use(express.json({ limit: "64kb" }));

app.use("/api/v1", apiRoutes);

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  console.error("Unhandled API error:", error);
  if (response.headersSent) return next(error);
  response.status(500).json({ error: "Internal server error." });
};
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Sentinel API listening on http://localhost:${port}`));