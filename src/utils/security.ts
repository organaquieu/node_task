import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthPayload, Role } from "../types";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const comparePassword = (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);

export const signToken = (payload: AuthPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: "24h" });

export const verifyToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  const userId = Number(decoded.userId);
  const role = decoded.role as Role;

  if (!Number.isInteger(userId) || !role) {
    throw new Error("Invalid token data");
  }

  return { userId, role };
};
