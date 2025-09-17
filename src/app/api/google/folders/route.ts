import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { GoogleAPIClient } from "@/lib/google";

export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Google tokens
    const { data: tokens } = await supabase
      .from("user_google_tokens")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (!tokens) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 },
      );
    }

    const googleClient = new GoogleAPIClient({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).getTime(),
    });

    const folders = await googleClient.listFolders();

    return NextResponse.json({
      success: true,
      folders: folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        parents: folder.parents,
      })),
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Get user's Google tokens
    const { data: tokens } = await supabase
      .from("user_google_tokens")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (!tokens) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 },
      );
    }

    const googleClient = new GoogleAPIClient({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).getTime(),
    });

    const folder = await googleClient.createFolder(name, parentId);

    return NextResponse.json({
      success: true,
      folder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
