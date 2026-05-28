import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { judgeId, nomineeId, ratings } = await request.json();

    if (!judgeId || !nomineeId || !ratings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify judge exists
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
    });

    if (!judge) {
      return NextResponse.json(
        { error: "Invalid judge" },
        { status: 401 }
      );
    }

    // Get nominee and category to calculate weighted score
    const nominee = await prisma.nominee.findUnique({
      where: { id: nomineeId },
      include: { category: true },
    });

    if (!nominee) {
      return NextResponse.json(
        { error: "Nominee not found" },
        { status: 404 }
      );
    }

    // Calculate total score based on criteria weights
    const criteria = nominee.category.criteria as Array<{
      name: string;
      weight: number;
    }>;

    let totalScore = 0;
    for (const criterion of criteria) {
      const rating = ratings[criterion.name] || 0;
      // Score = (Rating ÷ 5) × Weight
      totalScore += (rating / 5) * criterion.weight;
    }

    // Check if score already exists
    const existingScore = await prisma.score.findUnique({
      where: {
        judgeId_nomineeId: {
          judgeId,
          nomineeId,
        },
      },
    });

    let score;
    if (existingScore) {
      // Update existing score
      score = await prisma.score.update({
        where: { id: existingScore.id },
        data: {
          ratings,
          totalScore,
        },
        include: { judge: true },
      });
    } else {
      // Create new score
      score = await prisma.score.create({
        data: {
          judgeId,
          nomineeId,
          ratings,
          totalScore,
        },
        include: { judge: true },
      });
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const judgeId = request.nextUrl.searchParams.get("judgeId");
    const nomineeId = request.nextUrl.searchParams.get("nomineeId");

    const where: { judgeId?: string; nomineeId?: string } = {};
    if (judgeId) where.judgeId = judgeId;
    if (nomineeId) where.nomineeId = nomineeId;

    const scores = await prisma.score.findMany({
      where,
      include: {
        judge: true,
        nominee: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
