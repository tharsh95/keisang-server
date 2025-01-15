import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import carRoutes from "./routes/carRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", carRoutes);

export default app;
