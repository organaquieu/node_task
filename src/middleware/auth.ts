import { NextFunction, Request, Response } from "express";
import { Role } from "../types";
import { verifyToken } from "../utils/security";

const extractBearerToken = (authorization: string | undefined): string | null => {
  if (!authorization?.trim()) return null;
  const value = authorization.trim();
  if (value.startsWith("Bearer ")) {
    return value.slice("Bearer ".length).trim() || null;
  }
  // Clients that put only the JWT in the Authorization field (no "Bearer " prefix)
  return value;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    req.auth = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.role !== Role.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};

export const requireAdminOrSelf =
  (idParamName = "id") =>
  (req: Request, res: Response, next: NextFunction) => {
    const auth = req.auth;
    const targetId = Number(req.params[idParamName]);

    if (!auth) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (auth.role === Role.ADMIN || auth.userId === targetId) {
      return next();
    }

    return res.status(403).json({ message: "Access denied" });
  };
