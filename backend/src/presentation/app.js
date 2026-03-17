import express from "express";
import cors from "cors";
import swaggerui from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import syncRoutes from "./routes/sync.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import routineRoutes from "./routes/routine.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load(
  path.join(__dirname, "../../../docs/openapi.yaml")
);
app.use("/docs", swaggerui.serve, swaggerui.setup(swaggerDocument));

app.use("/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);

app.use("/api/sessions", sessionRoutes);
app.use("/api/routines", routineRoutes);
app.use("/sync", syncRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Simplegym API Activa",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

export default app;