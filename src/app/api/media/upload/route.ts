import { uploadFile } from "@/actions/media";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const uploadLimit = rateLimit(`media-upload:${ip}`, {
      intervalMs: 10 * 60 * 1000,
      max: 20,
    });
    if (!uploadLimit.success) {
      return NextResponse.json(
        { error: "Terlalu banyak unggahan. Silakan coba lagi nanti." },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const result = await uploadFile(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
