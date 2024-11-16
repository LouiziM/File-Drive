import { NextRequest, NextResponse } from "next/server";
import { generateSignedURLs } from "@/lib/S3HelperFunctions";

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.error("Invalid files input:", files);
      return NextResponse.json({ error: "Invalid files input" }, { status: 400 });
    }

    const signedURLs = await generateSignedURLs(request, files);

    if ("failure" in signedURLs) {
      console.error("Failure in signedURLs:", signedURLs);
      return NextResponse.json({ error: signedURLs.failure }, { status: 400 });
    }

    console.log("Signed URLs:", signedURLs);
    return NextResponse.json(signedURLs);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
