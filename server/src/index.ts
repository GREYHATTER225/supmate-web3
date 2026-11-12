import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { WebSocketRelay } from "./services/websocketRelay";
import { healthRouter } from "./routes/health";
import { notificationsRouter } from "./routes/notifications";
import { profileRouter } from "./routes/profile";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "5000", 10);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/health", healthRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/profile", profileRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// Initialize WebSocket Relay
WebSocketRelay.getInstance().init(wss);

server.listen(port, () => {
  console.log(`[Supmate Gateway] Running on http://localhost:${port}`);
  console.log(`[Supmate Gateway] WebSocket ready at ws://localhost:${port}/ws`);
  console.log(`[Supmate Gateway] Zero-Knowledge Security Boundaries Active`);
});
