import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { type Request, type Response, type NextFunction } from "express";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const
};

const generateAccessAndRefreshTokensAndSave = async (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  //save the refresh token to the refreshToken model
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
};

//----------------------------writing the controller to register the user----------------------------//
const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new ApiError(400, "Username ,email and password is required");
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
    if (existingUser) {
      throw new ApiError(
        409,
        "User with the same username and email already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokensAndSave(user.id);

    return res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      })
      .json(
        new ApiResponse(
          201,
          { user, accessToken },
          "User registered successfully"
        )
      );
  }
);

//----------------------------writing the controller to login the user----------------------------//
const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password is required");
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokensAndSave(user.id);

    const loggedInUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      })
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken },
          "Logged in successfully"
        )
      );
  }
);

//----------------------------writing the controller to logout the user----------------------------//
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

//----------------------------writing the controller to refresh the tokens----------------------------//
const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized,request");
  }
  const decoded = verifyRefreshToken(incomingToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: incomingToken }
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token expired or Invalid");
  }
  await prisma.refreshToken.delete({
    where: { token: incomingToken }
  });

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokensAndSave(decoded.userId);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    })
    .json(
      new ApiResponse(200, { accessToken }, "Tokens refreshed successfully")
    );
});

//----------------------------writing the controller to get the user details----------------------------//
const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user data fetched successfully")
    );
});

export { registerUser, loginUser, logoutUser, refresh, getMe };
