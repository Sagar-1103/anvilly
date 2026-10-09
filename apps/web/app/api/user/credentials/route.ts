import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const CREDENTIAL_SERVICE_URL = process.env.CREDENTIAL_SERVICE_URL || "http://127.0.0.1:3002";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.jwtToken) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${CREDENTIAL_SERVICE_URL}/api/v1/credentials`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.jwtToken}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Credentials API GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not connect to Credential Vault Service" },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.jwtToken) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${CREDENTIAL_SERVICE_URL}/api/v1/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Credentials API POST] Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not connect to Credential Vault Service" },
      { status: 502 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.jwtToken) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, message: "Credential ID required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${CREDENTIAL_SERVICE_URL}/api/v1/credentials/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.jwtToken}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Credentials API DELETE] Error:", error);
    return NextResponse.json(
      { success: false, message: "Could not connect to Credential Vault Service" },
      { status: 502 }
    );
  }
}
