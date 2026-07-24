import {
  PrismaClient,
  RoleName,
  AvailabilityStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

/**
 * Seed Misfit baseline data for Neon PostgreSQL.
 * Run: npx prisma db seed
 */
const prisma = new PrismaClient();

const DEFAULT_SKILLS = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Node.js", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Prisma", category: "Database" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Figma", category: "Design" },
  { name: "Python", category: "Language" },
  { name: "Machine Learning", category: "AI" },
  { name: "DevOps", category: "Infrastructure" },
  { name: "AWS", category: "Infrastructure" },
  { name: "Mobile (React Native)", category: "Mobile" },
  { name: "Product Management", category: "Product" },
];

async function upsertRole(name: RoleName, description: string) {
  return prisma.role.upsert({
    where: { name },
    update: { description },
    create: { name, description },
  });
}

async function main() {
  console.log("🌱 Seeding Misfit (Neon PostgreSQL)...");

  const founderRole = await upsertRole(
    RoleName.FOUNDER,
    "Entrepreneurs submitting startups and managing growth"
  );
  const freelancerRole = await upsertRole(
    RoleName.FREELANCER,
    "Independent talent working on Misfit projects"
  );
  const adminRole = await upsertRole(
    RoleName.ADMIN,
    "Platform administrators managing the ecosystem"
  );

  for (const skill of DEFAULT_SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }

  const adminPassword = await bcrypt.hash("Admin@Misfit1", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@misfit.app" },
    update: {},
    create: {
      email: "admin@misfit.app",
      passwordHash: adminPassword,
      roleId: adminRole.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Platform",
          lastName: "Admin",
          displayName: "Misfit Admin",
        },
      },
    },
  });

  const founderPassword = await bcrypt.hash("Founder@Misfit1", 12);
  await prisma.user.upsert({
    where: { email: "founder@misfit.app" },
    update: {},
    create: {
      email: "founder@misfit.app",
      passwordHash: founderPassword,
      roleId: founderRole.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Ada",
          lastName: "Founder",
          displayName: "Ada Founder",
          companyName: "Nova Labs",
        },
      },
    },
  });

  const freelancerPassword = await bcrypt.hash("Freelancer@Misfit1", 12);
  const freelancerUser = await prisma.user.upsert({
    where: { email: "freelancer@misfit.app" },
    update: {},
    create: {
      email: "freelancer@misfit.app",
      passwordHash: freelancerPassword,
      roleId: freelancerRole.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Sam",
          lastName: "Builder",
          displayName: "Sam Builder",
        },
      },
      freelancer: {
        create: {
          headline: "Full-stack engineer for early-stage startups",
          bio: "I help founders ship MVPs in weeks, not months.",
          hourlyRate: 75,
          yearsExperience: 6,
          availability: AvailabilityStatus.AVAILABLE,
          isVerified: true,
        },
      },
    },
    include: { freelancer: true },
  });

  console.log("✅ Roles:", {
    founder: founderRole.id,
    freelancer: freelancerRole.id,
    admin: adminRole.id,
  });
  console.log("✅ Skills seeded:", DEFAULT_SKILLS.length);
  console.log("✅ Demo users:", {
    admin: admin.email,
    founder: "founder@misfit.app",
    freelancer: freelancerUser.email,
  });
  console.log("⚠️  Change demo passwords immediately in production.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
