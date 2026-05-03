import { z } from "zod";
import { Role } from "../types";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(255),
  dateOfBirth: z.string().date(),
  email: z.string().email(),
  password: z.string().min(6).max(64),
  role: z.enum([Role.ADMIN, Role.USER]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const blockSchema = z.object({
  isActive: z.boolean().optional().default(false),
});
