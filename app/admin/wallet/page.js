"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wallet, BadgeCheck } from 'lucide-react';
import api from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import Pagination from '@/components/Pagination';

const statusBadge = (status) => {
  if (status === 'paid')    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Paid</span>;
  if (status === 'pending') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400">Pending</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">{status}</span>;
};

export default function WalletPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page, ps = pageSize) => {
    try {
      const r = await api.get('/wallet', { params: { page: p, limit: ps } });
      setItems(r.data.data || []);
      const meta = r.data.meta || {};
      setTotal(meta.total ?? (r.data.data || []).length);
      setTotalPages(meta.totalPages ?? 1);
    } catch {
      toast.error('Failed to load wallet requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, pageSize); }, [page, pageSize]);

  const pay = async (id) => {
    setPaying(id);
    try {
      await api.put(`/wallet/${id}/paid`);
      toast.success('Marked as paid');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to process payment');
    } finally {
      setPaying(null);
    }
  };

  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Wallet Redemptions</h1>
          <p className="text-[13px] text-txt-muted mt-1">Review and process member wallet redemption requests</p>
        </div>

        <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={15} className="text-txt-muted" />
              <span className="text-[14px] font-semibold text-txt">Redemption Requests</span>
            </div>
            <span className="text-[12px] text-txt-muted">{items.filter(i => i.status === 'pending').length} pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                  {['Member', 'Type', 'Amount', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading requests...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-txt-muted text-[13px]">No redemption requests</td></tr>
                ) : (
                  items.map(i => (
                    <tr key={i._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5 text-[13.5px] text-txt font-medium">{i.user?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-[13px] text-txt-sub capitalize">{i.type || '—'}</td>
                      <td className="px-5 py-3.5 text-[13.5px] font-semibold text-accent">${i.amount?.toFixed(2) || '0.00'}</td>
                      <td className="px-5 py-3.5">{statusBadge(i.status)}</td>
                      <td className="px-5 py-3.5">
                        {i.status === 'pending' ? (
                          <button
                            onClick={() => pay(i._id)}
                            disabled={paying === i._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <BadgeCheck size={13} />
                            {paying === i._id ? 'Processing...' : 'Mark Paid'}
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[12px] font-medium">✓ Paid</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            total={total}
          />
        </div>
      </div>
    </AdminShell>
  );
}
