import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IRegisterUserPayload, IVerifyEmailPayload } from "./auth.interface";
import httpStatus from "http-status";
import config from "../../config";
import crypto from "crypto";
import redisClient from "../../middleware/redis";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, password, phone } = payload;

  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const otpValue = crypto.randomInt(100000, 999999).toString();

  const otpKey = `user-registration-otp-${email}`;

  const expirationSeconds = 5 * 60;

  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
    phone,
  };

  const userRegistrationKey = `user-registration-data : ${email}`;

  await redisClient.set(
    userRegistrationKey,
    JSON.stringify(redisUserDataPayload),
    {
      expiration: {
        type: "EX",
        value: expirationSeconds,
      },
    },
  );

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-user-otp.ejs",
  );

  const templateData = {
    name,
    email,

    otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Email verification",
    html,
  });
};

const verifyUserEmail = async (payload: IVerifyEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email;

  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists?.email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  if (isUserExists?.status === "BANNED") {
    throw new AppError(httpStatus.BAD_REQUEST, "User is banned");
  }

  const otpKey = `user-registration-otp-${email}`;
  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP not found");
  }

  if (redisOtp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP does not match");
  }

  await redisClient.del(otpKey);

  const userRagistrationKey = `user-registration-data : ${email}`;

  const redisUserData = await redisClient.get(userRagistrationKey);

  if (!redisUserData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User registration data not found",
    );
  }

  const userPayload: IRegisterUserPayload = JSON.parse(redisUserData);

  const createUser = await prisma.user.create({
    data: {
      name: userPayload.name,
      email: userPayload.email,
      password: userPayload.password,
      phone: userPayload.phone,
      status: "ACTIVE",
      systemRole: "USER",
    },
    omit: {
      password: true,
    },
  });

  await redisClient.del(userRagistrationKey);

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/welcome-email.ejs",
  );

  const templateData = {
    name: createUser.name,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Welcome to Taskora",
    html,
  });

  const { ...user } = createUser;

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    systemRole: user.systemRole,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerUser,
  verifyUserEmail,
};
