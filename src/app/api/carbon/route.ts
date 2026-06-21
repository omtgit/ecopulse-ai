import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const entries = await prisma.carbonEntry.findMany({
      where: { userId, month, year },
    });

    const totalCo2Kg = entries.reduce((acc, e) => acc + e.co2Kg, 0);

    return NextResponse.json({ success: true, data: { totalCo2Kg, entries } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
}
