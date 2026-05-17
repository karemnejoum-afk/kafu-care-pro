import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const verifyStaffAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error("Unauthorized");
    const roles = (data ?? []).map((r) => r.role as string);
    const isStaff = roles.includes("staff") || roles.includes("admin");
    if (!isStaff) throw new Error("Forbidden");
    return { isStaff: true };
  });
