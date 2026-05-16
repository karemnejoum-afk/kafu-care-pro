// Helpers for service labels, statuses, WhatsApp messages

export const SERVICE_LABELS: Record<string, string> = {
  wash_exterior: "غسيل خارجي",
  wash_full: "غسيل شامل",
  polish: "تلميع",
  wax: "تشميع",
  interior_deep: "تنظيف داخلي عميق",
  full_package: "الباقة الكاملة",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "تم التأكيد",
  washing: "جاري الغسيل",
  polishing: "جاري التلميع",
  drying: "جاري التجفيف",
  ready: "جاهزة للاستلام",
  completed: "مكتملة",
  cancelled: "ملغية",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-blue-500/20 text-blue-300",
  washing: "bg-cyan-500/20 text-cyan-300",
  polishing: "bg-purple-500/20 text-purple-300",
  drying: "bg-yellow-500/20 text-yellow-300",
  ready: "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-300",
  cancelled: "bg-destructive/20 text-destructive",
};

export const STATUS_ORDER = ["pending", "confirmed", "washing", "polishing", "drying", "ready", "completed"];

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS);
export const SERVICE_OPTIONS = Object.keys(SERVICE_LABELS);

export function whatsappLink(phone: string | null | undefined, message: string) {
  const clean = (phone ?? "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function buildStatusMessage(
  customerName: string,
  carLabel: string,
  status: string,
) {
  const label = STATUS_LABELS[status] ?? status;
  return `مرحباً ${customerName} 👋\nتحديث حالة سيارتك (${carLabel}) في مركز كفو:\n*${label}*\nشكراً لاختياركم كفو 🧡`;
}
