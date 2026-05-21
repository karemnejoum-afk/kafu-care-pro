import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Car as CarIcon, Calendar } from "lucide-react";
import { SERVICE_LABELS, SERVICE_OPTIONS, STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from "@/lib/kafu";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

interface Car { id: string; make: string; model: string; year: number | null; color: string | null; plate_number: string | null; }
interface Booking { id: string; service_type: string; scheduled_at: string; status: string; notes: string | null; car_id: string; cars?: Car | null; }

function DashboardPage() {
  const { user, loading } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [carsRes, bookingsRes] = await Promise.all([
        supabase.from("cars").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("bookings").select("*, cars(*)").eq("customer_id", user.id).order("scheduled_at", { ascending: false }),
      ]);
      if (carsRes.error) { console.error("cars load error", carsRes.error); toast.error("تعذّر تحميل السيارات"); }
      if (bookingsRes.error) { console.error("bookings load error", bookingsRes.error); toast.error("تعذّر تحميل الحجوزات"); }
      setCars(carsRes.data ?? []);
      setBookings((bookingsRes.data ?? []) as Booking[]);
    })();
  }, [user, refresh]);

  if (loading) return <div className="container py-16 text-center">جاري التحميل...</div>;
  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="mb-4">يجب تسجيل الدخول للوصول إلى لوحتك.</p>
        <Button variant="hero" asChild><Link to="/login">تسجيل الدخول</Link></Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">أهلاً بك 👋</h1>
          <p className="text-muted-foreground">أدر سياراتك وحجوزاتك بسهولة</p>
        </div>
        <div className="flex gap-2">
          <AddCarDialog onAdded={() => setRefresh((x) => x + 1)} />
          <NewBookingDialog cars={cars} onAdded={() => setRefresh((x) => x + 1)} />
        </div>
      </div>

      {/* Cars */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CarIcon className="h-5 w-5 text-primary" /> سياراتي</h2>
        {cars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            لم تضف سيارات بعد. ابدأ بإضافة سيارة لحجز موعد.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                <div className="text-lg font-bold">{c.make} {c.model}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {c.year ?? "—"} • {c.color ?? "—"}
                </div>
                {c.plate_number && <div className="mt-3 inline-block rounded bg-secondary px-2 py-1 text-xs font-mono">{c.plate_number}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookings */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> حجوزاتي</h2>
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            لا توجد حجوزات بعد.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => <BookingCard key={b.id} b={b} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function BookingCard({ b }: { b: Booking }) {
  const car = b.cars;
  const idx = STATUS_ORDER.indexOf(b.status);
  const total = STATUS_ORDER.length - 1;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-bold">{SERVICE_LABELS[b.service_type] ?? b.service_type}</div>
          <div className="text-sm text-muted-foreground">
            {car ? `${car.make} ${car.model}` : "—"} • {new Date(b.scheduled_at).toLocaleString("ar-SA")}
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[b.status]}`}>
          {STATUS_LABELS[b.status]}
        </span>
      </div>
      {idx >= 0 && b.status !== "cancelled" && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full [background:var(--gradient-primary)] transition-all" style={{ width: `${(idx / total) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            {STATUS_ORDER.map((s, i) => (
              <span key={s} className={i <= idx ? "text-primary font-semibold" : ""}>{STATUS_LABELS[s]}</span>
            ))}
          </div>
        </div>
      )}
      {b.notes && <p className="text-sm text-muted-foreground mt-3">📝 {b.notes}</p>}
    </div>
  );
}

function AddCarDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState(""); const [model, setModel] = useState("");
  const [year, setYear] = useState(""); const [color, setColor] = useState(""); const [plate, setPlate] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (make.trim().length === 0 || make.length > 50) { toast.error("الماركة مطلوبة (حتى 50 حرف)"); return; }
    if (model.trim().length === 0 || model.length > 50) { toast.error("الموديل مطلوب (حتى 50 حرف)"); return; }
    const yearNum = year ? Number(year) : null;
    if (yearNum !== null && (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2035)) {
      toast.error("سنة غير صالحة (1900-2035)"); return;
    }
    if (color && color.length > 30) { toast.error("اللون طويل جداً"); return; }
    if (plate && plate.length > 20) { toast.error("رقم اللوحة طويل جداً"); return; }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { error } = await supabase.from("cars").insert({
      owner_id: user.id, make: make.trim(), model: model.trim(),
      year: yearNum, color: color || null, plate_number: plate || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت إضافة السيارة");
    setOpen(false); setMake(""); setModel(""); setYear(""); setColor(""); setPlate("");
    onAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="ml-1 h-4 w-4" /> أضف سيارة</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>إضافة سيارة جديدة</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الماركة *</Label><Input value={make} onChange={(e) => setMake(e.target.value)} required maxLength={50} /></div>
            <div><Label>الموديل *</Label><Input value={model} onChange={(e) => setModel(e.target.value)} required maxLength={50} /></div>
            <div><Label>السنة</Label><Input type="number" min={1900} max={2035} value={year} onChange={(e) => setYear(e.target.value)} /></div>
            <div><Label>اللون</Label><Input value={color} onChange={(e) => setColor(e.target.value)} maxLength={30} /></div>
          </div>
          <div><Label>رقم اللوحة</Label><Input value={plate} onChange={(e) => setPlate(e.target.value)} dir="ltr" maxLength={20} /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewBookingDialog({ cars, onAdded }: { cars: Car[]; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [carId, setCarId] = useState(""); const [service, setService] = useState("wash_full");
  const [when, setWhen] = useState(""); const [notes, setNotes] = useState(""); const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!carId) { toast.error("اختر سيارة"); return; }
    if (notes.length > 1000) { toast.error("الملاحظات طويلة جداً (حتى 1000 حرف)"); return; }
    const scheduled = new Date(when);
    if (isNaN(scheduled.getTime())) { toast.error("موعد غير صالح"); return; }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { error } = await supabase.from("bookings").insert({
      customer_id: user.id, car_id: carId, service_type: service as never,
      scheduled_at: scheduled.toISOString(), notes: notes || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم إنشاء الحجز");
    setOpen(false); setCarId(""); setWhen(""); setNotes("");
    onAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" disabled={cars.length === 0}><Plus className="ml-1 h-4 w-4" /> حجز جديد</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>احجز موعد</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>السيارة *</Label>
            <Select value={carId} onValueChange={setCarId}>
              <SelectTrigger><SelectValue placeholder="اختر سيارة" /></SelectTrigger>
              <SelectContent>
                {cars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.make} {c.model} {c.plate_number ? `(${c.plate_number})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>الخدمة *</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{SERVICE_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>الموعد *</Label>
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required dir="ltr" />
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "جاري الحجز..." : "تأكيد الحجز"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
