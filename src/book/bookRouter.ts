import express from "express";
import {
  createBook,
  updateBook,
  listBook,
  getSingleBook,
  deleteBook,
} from "./bookController";
import { fileData } from "./middleware";
import auth from "../middlewares/authentication";

const bookRouter = express.Router();

bookRouter.post("/", auth, fileData, createBook);

bookRouter.patch("/:bookId", auth, fileData, updateBook);

bookRouter.get("/", listBook);

bookRouter.get("/:bookId", getSingleBook);

bookRouter.delete("/:bookId", auth, deleteBook);

export default bookRouter;
