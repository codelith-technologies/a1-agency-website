import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This demo API is disabled. Staff authentication uses Supabase Auth." },
    { status: 410 },
  );
}
