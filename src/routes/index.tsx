import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Car, CalendarCheck, Bell, Droplets, Wand2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "كفو — احجز غسيل وتلميع سيارتك" },
      { name: "description", content: "مركز كفو لخدمات السيارات: غسيل، تلميع، وتتبع لحظي لحالة سيارتك مع إشعارات واتساب." },
    ],
  }),
});

function Index() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" /> مركز كفو لخدمات السيارات
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            سيارتك تستحق <span className="text-primary">الأفضل</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            احجز موعد غسيل أو تلميع بضغطة زر، وتابع كل مرحلة لحظة بلحظة — وإشعارات واتساب توصلك أول بأول.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">احجز موعدك الآن</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">لدي حساب</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">لماذا كفو؟</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: CalendarCheck, title: "حجز سهل", desc: "اختر سيارتك، الخدمة، والموعد — والباقي علينا." },
            { icon: Droplets, title: "تتبع لحظي", desc: "شاهد كل مرحلة: غسيل، تلميع، تجفيف، جاهزة." },
            { icon: Bell, title: "إشعارات واتساب", desc: "نبقيك على اطلاع بكل تحديث عبر واتساب." },
            { icon: Car, title: "كل سياراتك", desc: "أضف سياراتك وأدر حجوزاتها من مكان واحد." },
            { icon: Wand2, title: "تلميع احترافي", desc: "خبرة وأدوات متخصصة لإعادة لمعان سيارتك." },
            { icon: Sparkles, title: "جودة كفو", desc: "نظافة، دقة، واهتمام بأدق التفاصيل." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="rounded-2xl border border-primary/30 [background:var(--gradient-primary)] p-10 md:p-16 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-black">جاهز تجرّب كفو؟</h2>
          <p className="mt-3 opacity-90">سجّل خلال دقيقة واحجز أول موعد.</p>
          <div className="mt-6">
            <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
              <Link to="/signup">أنشئ حسابك مجاناً</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} مركز كفو لخدمات السيارات
      </footer>
    </main>
  );
}
