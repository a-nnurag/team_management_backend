import { getEnv } from "../utils/get-env.js";

import dotenv from "dotenv";
dotenv.config();

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGODB_URI: process.env.MONGODB_URI,

  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_EXPIRES_IN: process.env.SESSION_EXPIRES_IN,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  FRONTEND_GOOGLE_CALLBACK_URL: process.env.FRONTEND_GOOGLE_CALLBACK_URL,
});

const config = appConfig();

export default config;
