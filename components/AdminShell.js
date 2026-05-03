"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Clock, CalendarDays, BookOpen,
  CreditCard, CalendarCheck, Gift, Wallet, UserCheck,
  Settings, LogOut, Loader2, AlertTriangle,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/admin" },
  { icon: Users,           label: "Members",        href: "/admin/members" },
  { icon: Clock,           label: "Time Slots",     href: "/admin/time-slots" },
  { icon: CalendarDays,    label: "Class Schedule", href: "/admin/classes" },
  { icon: BookOpen,        label: "Bookings",       href: "/admin/bookings" },
  { icon: CreditCard,      label: "Subscriptions",  href: "/admin/memberships" },
  { icon: CalendarCheck,   label: "Events",         href: "/admin/events" },
  { icon: Gift,            label: "Referrals",      href: "/admin/referrals" },
  { icon: Wallet,          label: "Wallet",         href: "/admin/wallet" },
  { icon: UserCheck,       label: "Trainers",       href: "/admin/trainers" },
  { icon: Settings,        label: "Settings",       href: "/admin/settings" },
];

function LogoutModal({ onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={!loading ? onCancel : undefined}
    >
      <div
        className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/[0.12] border border-red-500/[0.25] flex items-center justify-center text-red-400">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-txt">Logout?</h3>
            <p className="text-[13px] text-txt-muted mt-1">Are you sure you want to log out of the admin portal?</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={14} />
                Yes, Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 1200));
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    document.cookie = "adminToken=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
          loading={loggingOut}
        />
      )}

      <aside className="w-[240px] flex-shrink-0 bg-bg-sidebar border-r border-white/[0.07] flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.07] flex-shrink-0">
          <img src="/logo.webp" alt="Six Point" className="h-10 w-auto flex-shrink-0" />
          <div>
            <div className="text-[12px] font-bold tracking-[2px] text-txt uppercase">Six Point</div>
            <div className="text-[10px] text-txt-muted tracking-[0.8px] uppercase">Admin Portal</div>
          </div>
        </div>

        <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] border transition-all duration-150 ${
                  active
                    ? 'bg-accent/[0.12] text-accent border-accent/[0.35] font-semibold'
                    : 'text-txt-sub border-transparent hover:bg-bg-hover hover:text-txt'
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2.5 pb-4 border-t border-white/[0.07] flex-shrink-0">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] border border-transparent text-txt-muted hover:bg-red-500/[0.10] hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={15} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-bg min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
