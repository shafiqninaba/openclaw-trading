import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateBot } from "@/lib/auth";

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      select: { id: true, date: true, summary: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch journal entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = authenticateBot(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { date, content, summary } = body;

    if (!date || !content) {
      return NextResponse.json(
        { error: "date and content are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.journalEntry.upsert({
      where: { date: new Date(date) },
      update: { content, summary, updatedAt: new Date() },
      create: { date: new Date(date), content, summary },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create journal entry:", error);
    return NextResponse.json(
      { error: "Failed to create journal entry" },
      { status: 500 }
    );
  }
}
