import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateBot } from "@/lib/auth";

export async function GET() {
  try {
    const items = await prisma.watchlist.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = authenticateBot(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { symbol, notes, target_entry, target_exit, stop_loss, status } =
      body;

    if (!symbol) {
      return NextResponse.json(
        { error: "symbol is required" },
        { status: 400 }
      );
    }

    const item = await prisma.watchlist.upsert({
      where: { symbol },
      update: {
        notes: notes || null,
        targetEntry: target_entry || null,
        targetExit: target_exit || null,
        stopLoss: stop_loss || null,
        status: status || "watching",
        updatedAt: new Date(),
      },
      create: {
        symbol,
        notes: notes || null,
        targetEntry: target_entry || null,
        targetExit: target_exit || null,
        stopLoss: stop_loss || null,
        status: status || "watching",
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to upsert watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to upsert watchlist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authError = authenticateBot(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "symbol query parameter is required" },
        { status: 400 }
      );
    }

    await prisma.watchlist.delete({ where: { symbol } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to delete watchlist item" },
      { status: 500 }
    );
  }
}
