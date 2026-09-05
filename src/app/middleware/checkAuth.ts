import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { SystemRole } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../lib/prisma";
import httpStatus from "http-status";

export interface RequestUser {
  email: string;
  userId: string;
  systemRole: SystemRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const auth = (...requiredRoles: SystemRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const { email, id, systemRole } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(systemRole)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to access this resource",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        systemRole,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.status === "BANNED") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User is banned. Please contact the admin.",
      );
    }

    req.user = {
      email,
      userId: id,
      systemRole,
    };
    next();
  });
};
