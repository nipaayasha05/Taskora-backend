import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  IGoogleLoginPayload,
  ILoginUserPayload,
  IRegisterUserPayload,
  IVerifyEmailPayload,
} from "./auth.interface";
import httpStatus from "http-status";
import config from "../../config";
import crypto from "crypto";
import redisClient from "../../middleware/redis";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import {
  AuthProvider,
  SystemRole,
  UserStatus,
} from "../../../../prisma/generated/prisma/enums";
import { is } from "zod/locales";

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

  if (isUserExists?.emailVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already verified");
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
      emailVerified: true,
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

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;

  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  if (user.status === "BANNED") {
    throw new AppError(httpStatus.BAD_REQUEST, "User is banned");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not match");
  }

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

const googleLogin = async (payload: IGoogleLoginPayload) => {
  let googleIdTokenPayload: TokenPayload | null | undefined = null;

  console.log({ payload });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });

    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.log(error, "google id token failed");
    throw new AppError(httpStatus.BAD_REQUEST, "Google id token failed");
  }

  if (!googleIdTokenPayload) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID token payload not found",
    );
  }

  if (!googleIdTokenPayload.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID token payload email not found",
    );
  }

  if (!googleIdTokenPayload.name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID token payload name not found",
    );
  }

  if (!googleIdTokenPayload?.email_verified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google ID token payload email not verified",
    );
  }

  const isUserExistsWithGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      systemRole: SystemRole.USER,
      googleId: googleIdTokenPayload.sub,
    },
  });

  let user = isUserExistsWithGoogleAuth;

  if (!isUserExistsWithGoogleAuth) {
    const ifUserExistsWithCredentials = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        systemRole: SystemRole.USER,
        authProvider: AuthProvider.CREDENTIAL,
      },
    });

    if (ifUserExistsWithCredentials) {
      if (ifUserExistsWithCredentials.status === UserStatus.BANNED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is banned");
      }

      user = await prisma.user.update({
        where: {
          id: ifUserExistsWithCredentials.id,
        },
        data: {
          googleId: googleIdTokenPayload.sub,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: googleIdTokenPayload.name,
          email: googleIdTokenPayload.email,
          systemRole: SystemRole.USER,
          googleId: googleIdTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
          emailVerified: true,
        },
      });

      const templatePath = path.join(
        process.cwd(),
        "src/app/templates/welcome-email.ejs",
      );

      const templateData = {
        name: user.name,
      };

      const html = await ejs.renderFile(templatePath, templateData);

      await transporter.sendMail({
        from: config.email_sender,
        to: user.email,
        subject: "Welcome to Taskora",
        html,
      });
    }
  }

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  if (user.status === UserStatus.BANNED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is banned");
  }

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
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerUser,
  verifyUserEmail,
  loginUser,
  googleLogin,
};
