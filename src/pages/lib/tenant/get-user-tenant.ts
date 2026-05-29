import { supabase } from "@/lib/supabase";

export async function getUserTenant() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("tenant_memberships")
    .select(`
      role,
      tenant:tenants (
        id,
        tenant_type,
        name,
        slug,
        owner_user_id,
        subscription_plan,
        subscription_status,
        logo_url,
        country,
        timezone,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error) {
    console.error("Tenant fetch error:", error);
    return null;
  }

  return data;
}