import { NextRequest, NextResponse } from "next/server";
import { getPortfolioHistory } from "@/lib/alpaca";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "1M";
    const timeframe = searchParams.get("timeframe") || "1D";
    const history = await getPortfolioHistory(period, timeframe);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch portfolio history:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio history" },
      { status: 500 }
    );
  }
}
