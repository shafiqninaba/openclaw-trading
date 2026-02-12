import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateBot } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { taughtAt: "desc" },
      include: { tradeReasoning: { select: { symbol: true, side: true } } },
    });
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = authenticateBot(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { title, description, category, taught_at, trade_reasoning_id } =
      body;

    if (!title || !description || !category || !taught_at) {
      return NextResponse.json(
        {
          error: "title, description, category, and taught_at are required",
        },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        category,
        taughtAt: new Date(taught_at),
        tradeReasoningId: trade_reasoning_id || null,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
