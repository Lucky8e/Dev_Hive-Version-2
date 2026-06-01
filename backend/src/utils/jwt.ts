import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

type TokenPayload = {
  userId: string;
};

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m"
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d"
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded) ||
    typeof decoded.userId !== "string"
  ) {
    throw new ApiError(401, "Invalid access token");
  }

  return { userId: decoded.userId };
};
export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded) ||
    typeof decoded.userId !== "string"
  ) {
    throw new ApiError(401, "Invalid refresh token");
  }

  return { userId: decoded.userId };
};
