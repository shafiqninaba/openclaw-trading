import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const entry = await prisma.tradeReasoning.findUnique({
      where: { alpacaOrderId: orderId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Trade reasoning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to fetch trade reasoning:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade reasoning" },
      { status: 500 }
    );
  }
}
