"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import AdminShell from '@/components/AdminShell';

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [form, setForm] = useState({ membershipId: '', referralReward: '', walletRedeem: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [sRes, mRes] = await Promise.all([api.get('/admin/setting'), api.get('/admin/membership')]);
      setSettings(sRes.data.data || []);
      setMemberships(mRes.data.data || []);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/setting', form);
      toast.success('Settings saved');
      setForm({ membershipId: '', referralReward: '', walletRedeem: '' });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Settings</h1>
          <p className="text-[13px] text-txt-muted mt-1">Configure referral and wallet redemption rules per membership tier</p>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
          {/* Form */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2">
              <Settings size={14} className="text-txt-muted" />
              <span className="text-[14px] font-semibold text-txt">Add / Update Rule</span>
            </div>
            <form onSubmit={submit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Membership Tier</label>
                <select className={inputCls + " cursor-pointer"} value={form.membershipId} onChange={e => setForm({ ...form, membershipId: e.target.value })} required>
                  <option value="">Select membership</option>
                  {memberships.map(m => <option key={m._id} value={m._id} className="bg-[#1c1c1c]">{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Referral Reward %</label>
                <input className={inputCls} type="number" min="0" max="100" placeholder="e.g. 10" value={form.referralReward} onChange={e => setForm({ ...form, referralReward: e.target.value })} required />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Wallet Redeem %</label>
                <input className={inputCls} type="number" min="0" max="100" placeholder="e.g. 5" value={form.walletRedeem} onChange={e => setForm({ ...form, walletRedeem: e.target.value })} required />
              </div>
              <button className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed" type="submit" disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Rule'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-txt">Current Rules</span>
              <span className="text-[12px] text-txt-muted">{settings.length} configured</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                    {['Membership', 'Referral %', 'Redeem %'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading...</td></tr>
                  ) : settings.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-12 text-center text-txt-muted text-[13px]">No rules configured</td></tr>
                  ) : (
                    settings.map(s => (
                      <tr key={s._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                        <td className="px-5 py-3.5 text-[13.5px] text-txt font-medium">{s.membershipId?.name || '—'}</td>
                        <td className="px-5 py-3.5"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/[0.12] text-accent">{s.referralReward}%</span></td>
                        <td className="px-5 py-3.5"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400">{s.walletRedeem}%</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
