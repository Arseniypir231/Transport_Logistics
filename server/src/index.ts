import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma.js";

const server = app.listen(env.port, () => {
  console.log(`Transport logistics API is running on http://localhost:${env.port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Closing API server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
