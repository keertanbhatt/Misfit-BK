import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./prisma";

async function bootstrap() {
  const app = createApp();

  if (!env.databaseUrl) {
    console.warn(
      "⚠️  DATABASE_URL is empty. Set your Neon connection string in .env — API is up, DB routes will fail until configured."
    );
  } else {
    try {
      await prisma.$connect();
      console.log("✅ Connected to Neon PostgreSQL");
    } catch (error) {
      console.warn(
        "⚠️  Could not connect to Neon PostgreSQL. Server will still start.",
        error instanceof Error ? error.message : error
      );
    }
  }

  const server = app.listen(env.port, () => {
    console.log(`🚀 Misfit API listening on http://localhost:${env.port}`);
    console.log(`   Health: http://localhost:${env.port}/api/v1/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
