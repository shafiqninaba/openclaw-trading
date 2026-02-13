import { NextRequest, NextResponse } from "next/server";
import { getOrders, getOpenOrders } from "@/lib/alpaca";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (status === "open") {
      const orders = await getOpenOrders();
      return NextResponse.json(orders);
    }

    const orders = await getOrders(limit);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
