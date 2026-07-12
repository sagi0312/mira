import { NextRequest, NextResponse } from "next/server";
import { analyzeFace } from "@/server/services/rekognitionService";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 },
      );
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Buffer.from(base64Data, "base64");

    const result = await analyzeFace(imageBytes);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
