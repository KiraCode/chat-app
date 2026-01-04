import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { handleClerkWebhook } from "../controllers/userController.js";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(clerkMiddleware());

app.use("/api/users", userRouter);

export { app };
