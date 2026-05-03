"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";

export default function CrudPage({ title, subtitle, endpoint, role, fields, columns, transformPayload }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get(endpoint, { params: { role } });
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = transformPayload
        ? transformPayload(form)
        : { ...form, role, ...(role ? { password: '123456' } : {}) };
      await api.post(endpoint, payload);
      toast.success('Saved successfully');
      setForm({});
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">{title}</h1>
        {subtitle && <p className="text-[13px] text-txt-muted mt-1">{subtitle}</p>}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
        {/* Form */}
        <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.07]">
            <span className="text-[14px] font-semibold text-txt">Add New</span>
          </div>
          <form onSubmit={submit} className="p-5 flex flex-col gap-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">
                  {f.label}
                </label>
                {f.type === 'select' ? (
                  <select
                    className={inputCls + " cursor-pointer"}
                    value={form[f.name] || ''}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.required}
                  >
                    <option value="">Select {f.label}</option>
                    {(f.options || []).map(o => (
                      <option key={o.value} value={o.value} className="bg-[#1c1c1c]">{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputCls}
                    type={f.type || 'text'}
                    placeholder={f.placeholder || ''}
                    value={form[f.name] || ''}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <button
              className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              type="submit"
              disabled={saving}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? 'Saving...' : 'Add Record'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
            <span className="text-[14px] font-semibold text-txt">Records</span>
            <span className="text-[12px] text-txt-muted">{items.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                  {columns.map(c => (
                    <th key={c.key} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-txt-muted text-[13px]">No records found</td></tr>
                ) : (
                  items.map(item => (
                    <tr key={item._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      {columns.map(c => (
                        <td key={c.key} className="px-5 py-3.5 text-[13.5px] text-txt align-middle">
                          {c.render ? c.render(item) : (item[c.key] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
