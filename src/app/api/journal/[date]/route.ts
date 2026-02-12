import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const entry = await prisma.journalEntry.findUnique({
      where: { date: new Date(date) },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to fetch journal entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entry" },
      { status: 500 }
    );
  }
}
