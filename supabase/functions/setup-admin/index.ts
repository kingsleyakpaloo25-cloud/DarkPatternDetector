import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "AndrewsOsei1@gmail.com";
const ADMIN_PASSWORD = "0244667232andrews";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find the admin user by email
    const { data: userList, error: listError } = await supabase.auth.admin
      .listUsers();

    if (listError) {
      return new Response(
        JSON.stringify({ error: listError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let adminUser = userList.users.find(
      (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    );

    // Create the admin user if they don't exist
    if (!adminUser) {
      const { data: created, error: createError } = await supabase.auth.admin
        .createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Admin", is_admin: true },
        });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      adminUser = created.user;
    }

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Failed to provision admin user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Upsert the profile and promote to admin (the auth trigger doesn't fire
    // for admin-created users, so we handle it here)
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: adminUser.id,
          email: adminUser.email ?? ADMIN_EMAIL,
          full_name: adminUser.user_metadata?.full_name ?? "Admin",
          is_admin: true,
        },
        { onConflict: "id" },
      );

    if (upsertError) {
      return new Response(
        JSON.stringify({ error: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin account provisioned and activated", email: ADMIN_EMAIL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
