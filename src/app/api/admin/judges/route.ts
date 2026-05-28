import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Only return judges who have logged in (have a name)
    const judges = await prisma.judge.findMany({
      where: {
        name: { not: null },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ judges });
  } catch (error) {
    console.error("Error fetching judges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
