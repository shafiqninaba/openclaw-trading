import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateBot } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const entries = await prisma.tradeReasoning.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch trade reasoning:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade reasoning" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = authenticateBot(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      alpaca_order_id,
      symbol,
      side,
      reasoning,
      strategy,
      stop_loss,
      take_profit,
      lesson,
    } = body;

    if (!alpaca_order_id || !symbol || !side || !reasoning) {
      return NextResponse.json(
        { error: "alpaca_order_id, symbol, side, and reasoning are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.tradeReasoning.create({
      data: {
        alpacaOrderId: alpaca_order_id,
        symbol,
        side,
        reasoning,
        strategy: strategy || null,
        stopLoss: stop_loss || null,
        takeProfit: take_profit || null,
        lesson: lesson || null,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create trade reasoning:", error);
    return NextResponse.json(
      { error: "Failed to create trade reasoning" },
      { status: 500 }
    );
  }
}
