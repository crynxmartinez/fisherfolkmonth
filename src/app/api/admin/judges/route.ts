import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const judges = await prisma.judge.findMany({
      orderBy: { code: "asc" },
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
