import { NextResponse } from "next/server";
import { loadHistory } from "@/lib/mcp/memory-mcp";

export async function GET() {
  try {
    const history = await loadHistory();
    return NextResponse.json(history);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
