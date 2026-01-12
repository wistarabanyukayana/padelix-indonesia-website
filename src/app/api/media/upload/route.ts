import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/actions/media";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadFile(formData);
    
    if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
