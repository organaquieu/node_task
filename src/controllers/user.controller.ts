import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  createUser,
  getUserById,
  listUsers,
  updateUserStatus,
  validateCredentials,
} from "../services/user.service";
import {
  blockSchema,
  idParamSchema,
  loginSchema,
  registerSchema,
} from "../utils/schemas";
import { signToken } from "../utils/security";

const sanitizeUser = (user: {
  id: number;
  fullName: string;
  dateOfBirth: Date;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id,
  fullName: user.fullName,
  dateOfBirth: user.dateOfBirth.toISOString().split("T")[0],
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }

  try {
    const user = await createUser(parsed.data);
    const token = signToken({ userId: user.id, role: user.role });

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }

  const user = await validateCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "User is blocked" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return res.status(200).json({
    token,
    user: sanitizeUser(user),
  });
};

export const getUser = async (req: Request, res: Response) => {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const user = await getUserById(parsed.data.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user: sanitizeUser(user) });
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await listUsers();
  return res.status(200).json({
    users: users.map(sanitizeUser),
  });
};

export const blockUser = async (req: Request, res: Response) => {
  const idParsed = idParamSchema.safeParse(req.params);
  if (!idParsed.success) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const bodyParsed = blockSchema.safeParse(req.body ?? {});
  if (!bodyParsed.success) {
    return res.status(400).json({ message: bodyParsed.error.flatten() });
  }

  try {
    const updated = await updateUserStatus(idParsed.data.id, bodyParsed.data.isActive);
    return res.status(200).json({ user: sanitizeUser(updated) });
  } catch {
    return res.status(404).json({ message: "User not found" });
  }
};
