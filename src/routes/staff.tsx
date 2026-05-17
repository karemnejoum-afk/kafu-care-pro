import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS, STATUS_OPTIONS, whatsappLink, buildStatusMessage } from "@/lib/kafu";
import { verifyStaffAccess } from "@/lib/staff-guard.functions";

export const Route = createFileRoute("/staff")({
  beforeLoad: async () => {
    try {
      await verifyStaffAccess();
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: StaffPage,
});

interface Row {
  id: string; service_type: string; scheduled_at: string; status: string;
  notes: string | null; customer_id: string; car_id: string;
  cars: { make: string; model: string; plate_number: string | null } | null;
  profiles: { full_name: string; phone: string | null } | null;
}

function StaffPage() {
  const { user, isStaff, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      // Bookings + cars + customer profile via two queries (no FK to profiles via PostgREST inference here)
      const { data: bs } = await supabase
        .from("bookings")
        .select("*, cars(make,model,plate_number)")
        .order("scheduled_at", { ascending: true });
      const ids = Array.from(new Set((bs ?? []).map((b) => b.customer_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id,full_name,phone").in("id", ids)
        : { data: [] as Array<{ id: string; full_name: string; phone: string | null }> };
      const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
      const merged: Row[] = (bs ?? []).map((b: any) => ({
        ...b,
        profiles: profMap.get(b.customer_id) ?? null,
      }));
      setRows(merged);
    })();
  }, [isStaff, refresh]);

  if (loading) return <div className="container py-16 text-center">جاري التحميل...</div>;
  if (!user) {
    return <div className="container mx-auto py-16 text-center">
      <p className="mb-4">سجّل الدخول أولاً.</p>
      <Button variant="hero" asChild><Link to="/login">دخول</Link></Button>
    </div>;
  }
  if (!isStaff) {
    return <div className="container mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold mb-3">غير مصرّح</h1>
      <p className="text-muted-foreground">هذه الصفحة للموظفين فقط. تواصل مع المدير لمنحك صلاحية.</p>
    </div>;
  }

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  async function updateStatus(row: Row, newStatus: string) {
    const { error } = await supabase.from("bookings").update({ status: newStatus as never }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الحالة");
    setRefresh((x) => x + 1);
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-black">لوحة الموظفين</h1>
          <p className="text-muted-foreground">إدارة الحجوزات وتحديث مراحل الخدمة</p>
        </div>
        <div className="w-56">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">لا توجد حجوزات</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const carLabel = r.cars ? `${r.cars.make} ${r.cars.model}${r.cars.plate_number ? ` - ${r.cars.plate_number}` : ""}` : "—";
            const customerName = r.profiles?.full_name || "العميل";
            const waMsg = buildStatusMessage(customerName, carLabel, r.status);
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="grid md:grid-cols-4 gap-4 items-start">
                  <div>
                    <div className="text-xs text-muted-foreground">العميل</div>
                    <div className="font-bold">{customerName}</div>
                    {r.profiles?.phone && <div className="text-xs text-muted-foreground" dir="ltr">{r.profiles.phone}</div>}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">السيارة والخدمة</div>
                    <div className="font-bold">{carLabel}</div>
                    <div className="text-sm text-muted-foreground">{SERVICE_LABELS[r.service_type]}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">الموعد</div>
                    <div className="text-sm">{new Date(r.scheduled_at).toLocaleString("ar-SA")}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" asChild disabled={!r.profiles?.phone}>
                      <a href={whatsappLink(r.profiles?.phone, waMsg)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="ml-1 h-4 w-4" /> إشعار واتساب
                      </a>
                    </Button>
                  </div>
                </div>
                {r.notes && <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">📝 {r.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
