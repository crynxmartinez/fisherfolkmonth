import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const judgeId = request.nextUrl.searchParams.get("judgeId");

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        nominees: {
          include: {
            scores: judgeId
              ? {
                  where: { judgeId },
                  include: { judge: true },
                }
              : {
                  include: { judge: true },
                },
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
