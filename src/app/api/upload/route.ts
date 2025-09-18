import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formId = formData.get("formId") as string;
    const fieldId = formData.get("fieldId") as string;

    if (!file || !formId || !fieldId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // You would fetch form/field details here to validate against,
    // e.g., allowed file types, max size.
    // This is a simplified example.

    const filePath = `${formId}/${fieldId}/${Date.now()}-${file.name}`;

    const { data, error }_ = await supabaseAdmin.storage
      .from("form-uploads")
      .upload(filePath, file);

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file." },
        { status: 500 }
      );
    }

    // Construct the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("form-uploads").getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
