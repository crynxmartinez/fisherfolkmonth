import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Find existing judge by name or create new one
    let judge = await prisma.judge.findFirst({
      where: { name: trimmedName },
    });

    if (!judge) {
      // Create new judge with auto-generated code
      const count = await prisma.judge.count();
      judge = await prisma.judge.create({
        data: {
          code: `JUDGE-${String(count + 1).padStart(3, "0")}`,
          name: trimmedName,
        },
      });
    }

    return NextResponse.json({
      judge: {
        id: judge.id,
        code: judge.code,
        name: judge.name,
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
