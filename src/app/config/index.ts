import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT!,
  app_url: process.env.APP_URL_URL!,
  databaseUrl: process.env.DATABASE_URL!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
  backend_url: process.env.BACKEND_URL!,
  frontend_url: process.env.FRONTEND_URL!,
  redis_user: process.env.REDIS_USER!,
  redis_password: process.env.REDIS_PASSWORD!,
  redis_port: process.env.REDIS_PORT!,
  redis_host: process.env.REDIS_HOST!,
  smtp_password: process.env.SMTP_PASSWORD!,
  smtp_user: process.env.SMTP_USER!,
  email_sender: process.env.EMAIL_SENDER!,
};
