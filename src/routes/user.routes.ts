import { Router } from "express";
import {
  blockUser,
  getUser,
  getUsers,
  login,
  register,
} from "../controllers/user.controller";
import { requireAdmin, requireAdminOrSelf, requireAuth } from "../middleware/auth";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/:id", requireAuth, requireAdminOrSelf("id"), getUser);
userRouter.get("/", requireAuth, requireAdmin, getUsers);
userRouter.patch("/:id/status", requireAuth, requireAdminOrSelf("id"), blockUser);

export { userRouter };
