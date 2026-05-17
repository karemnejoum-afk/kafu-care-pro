import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, LayoutDashboard, Users } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">حدث خطأ ما</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => { router.invalidate(); reset(); }}>إعادة المحاولة</Button>
          <Button variant="outline" asChild><a href="/">الرئيسية</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "كفو — مركز خدمات السيارات" },
      { name: "description", content: "احجز غسيل وتلميع سيارتك في مركز كفو. تتبع الحالة لحظياً." },
      { property: "og:title", content: "كفو — مركز خدمات السيارات" },
      { name: "twitter:title", content: "كفو — مركز خدمات السيارات" },
      { property: "og:description", content: "احجز غسيل وتلميع سيارتك في مركز كفو. تتبع الحالة لحظياً." },
      { name: "twitter:description", content: "احجز غسيل وتلميع سيارتك في مركز كفو. تتبع الحالة لحظياً." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b0699eab-3ea8-4f70-ba49-e22d8a6fe5d0/id-preview-7b613518--6d5a6930-a579-4d04-9088-d491bbeecde2.lovable.app-1779016065646.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b0699eab-3ea8-4f70-ba49-e22d8a6fe5d0/id-preview-7b613518--6d5a6930-a579-4d04-9088-d491bbeecde2.lovable.app-1779016065646.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NavBar() {
  const { user, isStaff, signOut, loading } = useAuth();
  return (
    <header className="border-b border-border bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/30 sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg [background:var(--gradient-primary)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-black text-primary">كفو</div>
            <div className="text-[10px] text-muted-foreground">خدمات السيارات</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link to="/dashboard"><LayoutDashboard className="ml-1 h-4 w-4" /> لوحتي</Link>
              </Button>
              {isStaff && (
                <Button variant="ghost" asChild size="sm">
                  <Link to="/staff"><Users className="ml-1 h-4 w-4" /> الموظفين</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="ml-1 h-4 w-4" /> خروج
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm"><Link to="/login">دخول</Link></Button>
              <Button variant="hero" asChild size="sm"><Link to="/signup">سجّل الآن</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavBar />
        <Outlet />
        <Toaster position="top-center" richColors theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
