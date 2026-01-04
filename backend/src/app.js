import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { handleClerkWebhook } from "../controllers/userController.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(clerkMiddleware());

app.use("/api/users", userRouter);
// never user express.json with body parser

app.use(express.json());

app.get("/api/test", requireAuth(), (req, res) => {
  res.json({ message: "Authenticated", userId: req.auth.userId });
});

export { app };
