import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { console.error("login error", error); toast.error("فشل الدخول: تحقّق من البريد وكلمة المرور"); return; }
    toast.success("مرحباً بعودتك!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold mb-2">تسجيل الدخول</h1>
        <p className="text-sm text-muted-foreground mb-6">أدخل بياناتك للوصول إلى حسابك في كفو</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ليس لديك حساب؟ <Link to="/signup" className="text-primary font-semibold">سجّل الآن</Link>
        </p>
      </div>
    </div>
  );
}
