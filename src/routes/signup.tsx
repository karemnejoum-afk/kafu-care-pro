import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("كلمة المرور 6 أحرف على الأقل"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) { toast.error("فشل التسجيل: " + error.message); return; }
    toast.success("تم إنشاء حسابك! جاري التوجيه...");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold mb-2">إنشاء حساب جديد</h1>
        <p className="text-sm text-muted-foreground mb-6">انضم إلى عائلة كفو</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">رقم الجوال (مع رمز الدولة، مثال: 9665XXXXXXXX)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" placeholder="9665XXXXXXXX" />
          </div>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب؟ <Link to="/login" className="text-primary font-semibold">دخول</Link>
        </p>
      </div>
    </div>
  );
}
