import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId } = body;

    if (!formId) {
      return NextResponse.json({ error: "Missing formId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the form to understand its structure
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("form_data")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get all submissions for this form
    const { data: submissions, error: submissionsError } = await supabase
      .from("form_submissions")
      .select("submission_data, submitted_at")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    // Generate CSV
    const fields = form.form_data?.fields || [];
    const headers = ["Submitted At", ...fields.map((field: any) => field.label || field.columnName || field.id)];
    
    const csvRows = [headers.join(",")];
    
    submissions.forEach((submission) => {
      const row = [
        new Date(submission.submitted_at).toLocaleString(),
        ...fields.map((field: any) => {
          const value = submission.submission_data[field.id] || "";
          // Escape CSV values
          return `"${String(value).replace(/"/g, '""')}"`;
        })
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="form-${formId}-submissions.csv"`,
      },
    });

  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
