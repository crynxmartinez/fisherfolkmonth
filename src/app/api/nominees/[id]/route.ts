import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const judgeId = request.nextUrl.searchParams.get("judgeId");

    const nominee = await prisma.nominee.findUnique({
      where: { id },
      include: {
        category: true,
        scores: judgeId
          ? {
              where: { judgeId },
              include: { judge: true },
            }
          : {
              include: { judge: true },
            },
      },
    });

    if (!nominee) {
      return NextResponse.json(
        { error: "Nominee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ nominee });
  } catch (error) {
    console.error("Error fetching nominee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
