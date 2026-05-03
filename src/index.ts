import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const start = async () => {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`Server started on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
