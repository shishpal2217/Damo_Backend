import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const _config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  env: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  CLOUDINART_SECRET: process.env.CLOUDINART_SECRET,
  CLOUDINART_API_KEY: process.env.CLOUDINART_API_KEY,
  CLOUDINART_URL: process.env.CLOUDINART_URL,
};
export const config = Object.freeze(_config);
