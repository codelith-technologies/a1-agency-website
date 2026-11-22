import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This demo API is disabled. Use the browser sign-out control." },
    { status: 410 },
  );
}
