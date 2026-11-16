import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Gives an active "source" subscriber a 60-second signed link to the zip.
// RLS on subscriptions, project_access and storage enforces ownership too.
export async function GET(request: NextRequest, ctx: RouteContext<"/account/download/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(new URL("/login?next=/account", request.url));

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("project_id,status,option,user_id")
    .eq("id", id)
    .maybeSingle();
  if (!sub || sub.user_id !== auth.user.id || sub.status !== "active" || sub.option !== "source") {
    return new NextResponse("Not available", { status: 403 });
  }

  const { data: acc } = await supabase.from("project_access").select("source_path").eq("project_id", sub.project_id).maybeSingle();
  if (!acc?.source_path) return new NextResponse("Source not uploaded yet", { status: 404 });

  const { data: signed, error } = await supabase.storage.from("sources").createSignedUrl(acc.source_path, 60, { download: true });
  if (error || !signed) return new NextResponse("Could not create download link", { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
