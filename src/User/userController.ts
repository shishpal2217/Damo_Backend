import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import jwt, { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  //validation

  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //datebase calling
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(400, "User already exists");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while finding user"));
  }

  //password hashing
  let newUser: User;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(error);
  }

  try {
    //token genration
    const token = sign({ id: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    res.status(201).json({
      data: {
        name: newUser.name,
        email: newUser.email,
        token: token,
      },
      message: "User created successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await userModel.findOne({ email });
  } catch (error) {
    return next(createHttpError(500, "Error while finding user"));
  }
  if (!existingUser) {
    const error = createHttpError(401, "Invalid credentials");
    return next(error);
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );
  if (!isPasswordCorrect) {
    const error = createHttpError(401, "Invalid credentials");
    return next(error);
  }

  try {
    const token = sign({ sub: existingUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    res.status(200).json({
      data: {
        name: existingUser.name,
        email: existingUser.email,
        token: token,
      },
      message: "Login successful",
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating token"));
  }
};

export { createUser, loginUser };
