"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users, Wallet, CalendarCheck, TrendingUp, Percent } from 'lucide-react';
import api from '@/lib/api';
import AdminShell from '@/components/AdminShell';

const statConfig = [
  { key: 'activeMemberships', label: 'Active Members',      icon: Users,         color: '#c9a84c' },
  { key: 'pendingWallet',     label: 'Pending Redemptions', icon: Wallet,        color: '#60a5fa' },
  { key: 'todaysBookings',    label: "Today's Bookings",    icon: CalendarCheck, color: '#4ade80' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Dashboard</h1>
          <p className="text-[13px] text-txt-muted mt-1">Overview of your gym operations</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statConfig.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="bg-bg-card border border-white/[0.07] rounded-xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-txt-muted uppercase tracking-[0.8px]">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                  <Icon size={15} strokeWidth={2} />
                </div>
              </div>
              <div className="text-[38px] font-bold text-txt tracking-[-1.5px] leading-none">
                {loading ? '—' : (stats?.[key] ?? 0)}
              </div>
            </div>
          ))}
        </div>

        {/* Lower Grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
          {/* Membership Breakdown */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-txt">Membership Breakdown</span>
              <TrendingUp size={15} className="text-txt-muted" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                    <th className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px]">Membership Tier</th>
                    <th className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px]">Active Members</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={2} className="px-5 py-10 text-center text-txt-muted text-[13px]">Loading...</td></tr>
                  ) : !(stats?.membershipOverview || []).length ? (
                    <tr><td colSpan={2} className="px-5 py-10 text-center text-txt-muted text-[13px]">No data available</td></tr>
                  ) : (
                    (stats.membershipOverview).map(row => (
                      <tr key={row.name} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                            {row.name}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/[0.12] text-accent">{row.users}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-txt">Quick Stats</span>
              <Percent size={15} className="text-txt-muted" />
            </div>
            <div className="p-5 flex flex-col divide-y divide-white/[0.07]">
              {[
                { label: 'Total Members',   value: stats?.totalMembers   ?? '—' },
                { label: 'Attendance Rate', value: stats?.attendanceRate != null ? `${stats.attendanceRate}%` : '—' },
                { label: 'Total Referrals', value: stats?.totalReferrals ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <span className="text-[13px] text-txt-muted">{label}</span>
                  <span className="text-[14px] font-semibold text-txt">{loading ? '—' : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
