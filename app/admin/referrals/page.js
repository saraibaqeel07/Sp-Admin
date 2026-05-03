"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Gift, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import AdminShell from '@/components/AdminShell';

const statusBadge = (status) => {
  if (status === 'Joined')  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Joined</span>;
  if (status === 'Pending') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400">Pending</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">{status}</span>;
};

export default function ReferralsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  const load = async () => {
    try {
      const r = await api.get('/referrals/admin');
      setItems(r.data.data || []);
    } catch {
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const complete = async (id) => {
    setCompleting(id);
    try {
      await api.patch(`/referrals/admin/${id}/status`, { status: 'Joined' });
      toast.success('Referral marked as joined — commission granted');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update referral');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Referrals</h1>
          <p className="text-[13px] text-txt-muted mt-1">Track member referrals and approve commissions</p>
        </div>

        <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift size={15} className="text-txt-muted" />
              <span className="text-[14px] font-semibold text-txt">Referral Requests</span>
            </div>
            <span className="text-[12px] text-txt-muted">{items.filter(i => i.status === 'Pending').length} pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                  {['Referrer', 'Referred Person', 'Status', 'Reward', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading referrals...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-txt-muted text-[13px]">No referrals found</td></tr>
                ) : (
                  items.map(i => (
                    <tr key={i._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-[13.5px] text-txt font-medium">{i.referrer?.fullName || i.referrer?.name || '—'}</div>
                        <div className="text-[11px] text-txt-muted mt-0.5">{i.referrer?.membership ? i.referrer?.membership + " " +'Tier' : '-'} </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[13.5px] text-txt font-medium">{i.fullName || i.referredName || '—'}</div>
                        <div className="text-[11px] text-txt-muted mt-0.5">{i.email || i.referredEmail || ''}</div>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(i.status)}</td>
                      <td className="px-5 py-3.5">
                        {i.status === 'Joined'
                          ? <span className="text-[13.5px] font-semibold text-emerald-400">${i.rewardAmount || 0}</span>
                          : <span className="text-txt-muted">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {i.status === 'Pending' ? (
                          <button
                            onClick={() => complete(i._id)}
                            disabled={completing === i._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <UserPlus size={13} />
                            {completing === i._id ? 'Updating...' : 'Mark Joined'}
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[12px] font-medium">✓ Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
