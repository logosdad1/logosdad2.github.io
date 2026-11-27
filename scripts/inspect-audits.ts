import { prisma } from "../src/lib/prisma";

async function main() {
  const audits = await prisma.audit.findMany({
    select: {
      id: true,
      businessName: true,
      url: true,
      isPaid: true,
      tier: true,
      status: true,
      overallScore: true,
      userId: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  console.log("Recent Audits in DB:", JSON.stringify(audits, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
