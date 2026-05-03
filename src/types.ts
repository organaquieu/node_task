/** Mirrors `enum Role` in prisma/schema.prisma — avoids importing enum types before `prisma generate`. */
export const Role = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type AuthPayload = {
  userId: number;
  role: Role;
};
