import express from "express";
import createHttpError from "http-errors";
import gobalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./User/userRoutes";
import bookRouter from "./book/bookRouter";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res, next) => {
  res.json({
    message: "jai maa kali",
  });
});

app.use("/api/v1/users", userRouter);

app.use("/api/v1/books", bookRouter);

//global error handler
app.use(gobalErrorHandler);

export default app;
