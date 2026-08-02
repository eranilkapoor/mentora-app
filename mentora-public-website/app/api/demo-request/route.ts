import { NextResponse } from "next/server";

type DemoRequestPayload = {
  city?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  program?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const tenantCode = process.env.NEXT_PUBLIC_DEMO_TENANT_CODE ?? "MENTORA-DEMO";

export async function POST(request: Request) {
  const payload = (await request.json()) as DemoRequestPayload;
  const firstName = payload.firstName?.trim();
  const email = payload.email?.trim();
  const phone = payload.phone?.trim();

  if (!firstName) {
    return NextResponse.json(
      { message: "First name is required" },
      { status: 400 },
    );
  }

  if (!email && !phone) {
    return NextResponse.json(
      { message: "Work email or phone is required" },
      { status: 400 },
    );
  }

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        mode: "local",
        message:
          "Demo request captured locally. Configure NEXT_PUBLIC_API_BASE_URL to forward it to Mentora CRM.",
      },
      { status: 202 },
    );
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/leads/capture`, {
    body: JSON.stringify({
      tenantCode,
      firstName,
      lastName: payload.lastName?.trim(),
      email,
      phone,
      city: payload.city?.trim(),
      program: payload.program?.trim(),
      utm: {
        source: "public_website",
        campaign: "mentora_demo",
      },
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Could not send demo request to Mentora CRM" },
      { status: response.status },
    );
  }

  return NextResponse.json({
    mode: "crm",
    message: "Demo request sent to Mentora CRM.",
  });
}
