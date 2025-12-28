import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { handleClerkWebhook } from "../controllers/userController.js";

const app = express();

app.use(cors());

app.post(
  "/api/users/webhooks",
  bodyParser.raw({ type: "application/json" }),
  handleClerkWebhook
);

export { app };
