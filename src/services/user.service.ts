import { prisma } from "../config/prisma";
import { Role } from "../types";
import { comparePassword, hashPassword } from "../utils/security";

type RegisterInput = {
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  role?: Role;
};

export const createUser = async (payload: RegisterInput) => {
  const passwordHash = await hashPassword(payload.password);

  return prisma.user.create({
    data: {
      fullName: payload.fullName,
      dateOfBirth: new Date(payload.dateOfBirth),
      email: payload.email.toLowerCase(),
      passwordHash,
      role: payload.role ?? Role.USER,
    },
  });
};

export const validateCredentials = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return null;

  const passwordMatched = await comparePassword(password, user.passwordHash);
  if (!passwordMatched) return null;

  return user;
};

export const getUserById = (id: number) =>
  prisma.user.findUnique({
    where: { id },
  });

export const listUsers = () =>
  prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

export const updateUserStatus = (id: number, isActive: boolean) =>
  prisma.user.update({
    where: { id },
    data: { isActive },
  });
