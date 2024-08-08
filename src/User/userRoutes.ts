import express from "express";
import { createUser, loginUser } from "./userController";
const userRouter = express.Router();

userRouter.post("/regisgter", createUser);

userRouter.post("/login", loginUser);

export default userRouter;
