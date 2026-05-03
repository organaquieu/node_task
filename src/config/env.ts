import "dotenv/config";

const requiredEnv = ["JWT_SECRET"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET as string,
};
