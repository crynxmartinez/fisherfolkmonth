import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, name } = await request.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "Judge code and name are required" },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!judge) {
      return NextResponse.json(
        { error: "Invalid judge code" },
        { status: 401 }
      );
    }

    // Update judge name if not set or different
    if (!judge.name || judge.name !== name) {
      await prisma.judge.update({
        where: { id: judge.id },
        data: { name },
      });
    }

    return NextResponse.json({
      judge: {
        id: judge.id,
        code: judge.code,
        name: name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
