import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Demo admin credentials for testing and local development
const DEMO_CREDENTIALS = [
  {
    email: "admin@a-oneagency.lk",
    password: "admin123456",
    name: "A-One Administrator",
    role: "admin",
  },
  {
    email: "admin@a-oneagency.com",
    password: "admin123456",
    name: "A-One Administrator",
    role: "admin",
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Validate credentials: match demo list or accept any email with the demo password
    const matchedUser = DEMO_CREDENTIALS.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    const isValid = matchedUser || password === "admin123456";

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Use demo password: admin123456" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", "mock-admin-session-token", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        email: normalizedEmail,
        name: matchedUser?.name ?? "Administrator",
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
