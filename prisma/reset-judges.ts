import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetJudges() {
  console.log("Deleting all scores...");
  await prisma.score.deleteMany({});
  
  console.log("Deleting all judges...");
  await prisma.judge.deleteMany({});
  
  console.log("✅ All judges and scores have been cleared!");
  
  await pool.end();
}

resetJudges().catch(console.error);
