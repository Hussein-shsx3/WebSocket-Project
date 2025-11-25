import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { config } from "../config/env.config";

/**
 * JWT Token Types
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  try {
    const signOptions: any = {
      expiresIn: config.JWT_EXPIRE,
      algorithm: "HS256",
    };
    const token = jwt.sign(payload, config.JWT_SECRET as string, signOptions);
    return token;
  } catch (error) {
    console.error("❌ Error generating access token:", error);
    throw new Error("Failed to generate access token");
  }
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  try {
    const signOptions: any = {
      expiresIn: config.JWT_REFRESH_EXPIRE,
      algorithm: "HS256",
    };
    const token = jwt.sign(payload, config.JWT_REFRESH_SECRET as string, signOptions);
    return token;
  } catch (error) {
    console.error("❌ Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
};

/**
 * Generate Both Access and Refresh Tokens
 */
export const generateAuthTokens = (payload: Omit<TokenPayload, "iat" | "exp">): AuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  try {
    const verifyOptions: VerifyOptions = {
      algorithms: ["HS256"],
    };
    const decoded = jwt.verify(token, config.JWT_SECRET as string, verifyOptions) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw error;
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): DecodedToken => {
  try {
    const verifyOptions: VerifyOptions = {
      algorithms: ["HS256"],
    };
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET as string, verifyOptions) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

/**
 * Refresh Access Token using Refresh Token
 */
export const refreshAccessToken = (refreshToken: string): AuthTokens => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newTokens = generateAuthTokens({
      userId: decoded.userId,
      email: decoded.email,
    });
    return newTokens;
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    throw new Error("Failed to refresh access token");
  }
};

/**
 * Decode Token without Verification (for debugging)
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return null;
  }
};
