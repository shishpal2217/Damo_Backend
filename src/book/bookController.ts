import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs";

export interface AuthRequest extends Request {
  userId: string;
}

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const filename = files.coverImage[0].filename;
  const coverImageMineType = files.coverImage[0].mimetype.split("/").at(-1);

  const filePath = path.resolve(
    __dirname,
    "../../public/data/upload",
    filename
  );
  const UploadCoverImage = await cloudinary.uploader.upload(filePath, {
    filename_override: filename,
    folder: "book-cover",
    format: coverImageMineType,
  });

  const bookfilename = files.file[0].filename;
  const bookFilePath = path.resolve(
    __dirname,
    "../../public/data/upload",
    bookfilename
  );

  const bookUploadCoverImage = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    filename_override: bookfilename,
    folder: "book-pdfs",
    format: "pdf",
  });

  if (!title || !genre) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //datebase calling
  const _req = req as AuthRequest;
  try {
    const book = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: UploadCoverImage.secure_url,
      file: bookUploadCoverImage.secure_url,
    });

    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    return res.status(201).json({ book });
  } catch (error) {
    return next(createHttpError(500, "Error while creating book"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const { bookId } = req.params;

  if (!bookId) {
    const error = createHttpError(400, "Book Id is required");
    return next(error);
  }

  // if (!title || !genre) {
  //   const error = createHttpError(400, "All fields are required");
  //   return next(error);
  // }

  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    const error = createHttpError(404, "Book not found");
    return next(error);
  }

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    const error = createHttpError(403, "You can not update this book");
    return next(error);
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let compleCoverImage;

  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const coverFilePath = path.resolve(
      __dirname,
      "../../public/data/upload",
      filename
    );
    compleCoverImage = filename;
    const coverUploadCoverImage = await cloudinary.uploader.upload(
      coverFilePath,
      {
        filename_override: compleCoverImage,
        folder: "book-cover",
        format: files.coverImage[0].mimetype.split("/").at(-1),
      }
    );
    compleCoverImage = coverUploadCoverImage.secure_url;
    await fs.promises.unlink(coverFilePath);
  }

  let compleFile;
  if (files.file) {
    const filename = files.file[0].filename;
    const fileFilePath = path.resolve(
      __dirname,
      "../../public/data/upload",
      filename
    );
    compleFile = filename;
    const fileUploadCoverImage = await cloudinary.uploader.upload(
      fileFilePath,
      {
        resource_type: "raw",
        filename_override: compleFile,
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    compleFile = fileUploadCoverImage.secure_url;
    await fs.promises.unlink(fileFilePath);
  }
  const updatedBook = await bookModel.findOneAndUpdate(
    { _id: bookId },
    {
      title,
      genre,
      coverImage: compleCoverImage ? compleCoverImage : book.coverImage,
      file: compleFile ? compleFile : book.file,
    },
    { new: true }
  );
  return res.status(200).json({ book: updatedBook });
};

const listBook = async (req: Request, res: Response, next: NextFunction) => {
  //add pagination
  const books = await bookModel.find({});
  return res.status(200).json({ books });
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bookId } = req.params;
  if (!bookId) {
    const error = createHttpError(400, "Book Id is required");
    return next(error);
  }
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    const error = createHttpError(404, "Book not found");
    return next(error);
  }
  return res.status(200).json({ book });
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const { bookId } = req.params;
  if (!bookId) {
    const error = createHttpError(400, "Book Id is required");
    return next(error);
  }

  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    const error = createHttpError(404, "Book not found");
    return next(error);
  }
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    const error = createHttpError(403, "You can not delete this book");
    return next(error);
  }

  // await cloudinary.uploader.destroy(book.coverImage.split("/"));
  // await cloudinary.uploader.destroy(book.file.split("/"));
  //delete cloudinary image need a public id
  const coverImage = book.coverImage.split("/");
  const coverImagePublic =
    coverImage[coverImage.length - 2] +
    "/" +
    coverImage[coverImage.length - 1].split(".").at(-2);

  console.log(coverImagePublic, "coverImagePublic");

  const file = book.file.split("/");
  const filePublic = file[file.length - 2] + "/" + file[file.length - 1];

  await cloudinary.uploader.destroy(coverImagePublic);
  await cloudinary.uploader.destroy(filePublic, {
    resource_type: "raw",
  });

  const data = await bookModel.deleteOne({ _id: bookId });
  return res.status(204).json({ message: "Book deleted successfully", book });
};

export { createBook, updateBook, listBook, getSingleBook, deleteBook };
