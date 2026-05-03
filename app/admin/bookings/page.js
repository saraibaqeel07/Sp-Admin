"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, X, ClipboardEdit, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import AdminShell from '@/components/AdminShell';

const statusBadge = (status) => {
  const map = {
    PENDING:   { cls: 'bg-yellow-500/10 text-yellow-400',   label: 'Pending' },
    APPROVED:  { cls: 'bg-emerald-500/10 text-emerald-400', label: 'Approved' },
    REJECTED:  { cls: 'bg-red-500/10 text-red-400',         label: 'Rejected' },
    attended:  { cls: 'bg-emerald-500/10 text-emerald-400', label: 'Attended' },
    cancelled: { cls: 'bg-red-500/10 text-red-400',         label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'bg-white/[0.07] text-txt-sub', label: status };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
};

function DecideModal({ booking, onClose, onSuccess }) {
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!status) return;
    setSaving(true);
    try {
      await api.patch(`admin/bookings/${booking._id}/decide`, { status });
      toast.success(`Booking ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={!saving ? onClose : undefined}
    >
      <div
        className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <ClipboardEdit size={15} className="text-txt-muted" />
            <span className="text-[15px] font-semibold text-txt">Decide Booking</span>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-txt-muted hover:text-txt hover:bg-white/[0.07] transition-colors disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 pt-5 pb-2 flex flex-col gap-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-txt-muted">Member</span>
            <span className="text-txt font-medium">{booking.clientId?.fullName || '—'}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-txt-muted">Class</span>
            <span className="text-txt">{booking.classId?.classTypeId?.name || booking.classId?.name || '—'}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-txt-muted">Current Status</span>
            <span>{statusBadge(booking.status)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 pb-6 pt-4 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Update Status</label>
            <select
              className="w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all cursor-pointer"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
            >
              <option value="">Select status</option>
              <option value="APPROVED" className="bg-[#1c1c1c]">APPROVED</option>
              <option value="REJECTED" className="bg-[#1c1c1c]">REJECTED</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !status}
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decideBooking, setDecideBooking] = useState(null);

  const load = async () => {
    try {
      const r = await api.get('admin/bookings');
      setItems(r.data.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);


  return (
    <AdminShell>
      {decideBooking && (
        <DecideModal
          booking={decideBooking}
          onClose={() => setDecideBooking(null)}
          onSuccess={load}
        />
      )}

      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Bookings</h1>
          <p className="text-[13px] text-txt-muted mt-1">Manage class bookings and mark attendance</p>
        </div>

        <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-txt-muted" />
              <span className="text-[14px] font-semibold text-txt">All Bookings</span>
            </div>
            <span className="text-[12px] text-txt-muted">{items.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                  {['Member', 'Email', 'Class', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading bookings...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-txt-muted text-[13px]">No bookings found</td></tr>
                ) : (
                  items.map(i => (
                    <tr key={i._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5 text-[13.5px] text-txt font-medium">{i.clientId?.fullName || '—'}</td>
                      <td className="px-5 py-3.5 text-[13px] text-txt-sub">{i.clientId?.email || '—'}</td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.classId?.classTypeId?.name || i.classId?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-[13px] text-txt-sub">
                        {i.classId?.date ? new Date(i.classId.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(i.status)}</td>
                      <td className="px-5 py-3.5">
                        {(i.status == 'APPROVED' ||  i.status == 'REJECTED') ? "-" :   <button
                          onClick={() => setDecideBooking(i)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[12px] font-semibold rounded-lg transition-colors"
                        >
                          <ClipboardEdit size={12} />
                          Update Status
                        </button>}
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
