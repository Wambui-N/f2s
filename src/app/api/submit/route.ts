import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, submissionData } = body;

    if (!formId || !submissionData) {
      return NextResponse.json({ error: "Missing formId or submissionData" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Store the submission in the database
    const { data: submission, error: submissionError } = await supabase
      .from("form_submissions")
      .insert({
        form_id: formId,
        submission_data: submissionData,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Submission storage error:", submissionError);
      return NextResponse.json({ error: "Failed to store submission" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id 
    });

  } catch (error) {
    console.error("Submit API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}