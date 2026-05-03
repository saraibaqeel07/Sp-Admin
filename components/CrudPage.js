"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import TimeScrollPicker from './TimeScrollPicker';

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";

function FieldInput({ f, value, onChange, errStyle }) {
  if (f.type === 'select') {
    return (
      <select
        className={inputCls + " cursor-pointer"}
        style={errStyle}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select {f.label}</option>
        {(f.options || []).map(o => (
          <option key={o.value} value={o.value} className="bg-[#1c1c1c]">{o.label}</option>
        ))}
      </select>
    );
  }
  if (f.type === 'time') {
    return (
      <TimeScrollPicker
        className={inputCls}
        value={value || ''}
        onChange={onChange}
        placeholder="HH : MM"
        errStyle={errStyle}
      />
    );
  }
  if (f.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="accent-accent w-4 h-4" />
        <span className="text-[13px] text-txt">{f.checkboxLabel || f.label}</span>
      </label>
    );
  }
  return (
    <input
      className={inputCls}
      style={errStyle}
      type={f.type || 'text'}
      placeholder={f.placeholder || ''}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function DeleteModal({ itemName, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={!loading ? onCancel : undefined}
    >
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/[0.12] border border-red-500/[0.25] flex items-center justify-center text-red-400">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-txt">Delete Record?</h3>
            <p className="text-[13px] text-txt-muted mt-1">
              Are you sure you want to delete <span className="text-txt font-medium">"{itemName}"</span>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Deleting...</> : <><Trash2 size={14} />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ item, fields, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...item });
  const [errors, setErrors] = useState({});

  const setField = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSave = () => {
    const errs = {};
    fields.forEach(f => {
      if (f.required && f.type !== 'checkbox' && (!form[f.name] || !String(form[f.name]).trim())) {
        errs[f.name] = `${f.label} is required`;
      }
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const { _id, createdAt, updatedAt, deletedAt, __v, nameNormalized, ...payload } = form;
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={!saving ? onCancel : undefined}
    >
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <h3 className="text-[15px] font-semibold text-txt">Edit Record</h3>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {fields.map(f => {
            const errStyle = errors[f.name] ? { borderColor: '#ef4444' } : {};
            return (
              <div key={f.name}>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">
                  {f.label}{f.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
                </label>
                <FieldInput f={f} value={form[f.name]} onChange={v => setField(f.name, v)} errStyle={errStyle} />
                {errors[f.name] && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors[f.name]}</p>}
              </div>
            );
          })}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onCancel} disabled={saving} className="w-full px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrudPage({ title, subtitle, endpoint, role, fields, columns, transformPayload }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("adminUser") || "{}");
      setIsTrainer(u?.role === "TRAINER");
    } catch { /* ignore */ }
  }, []);

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

  const setField = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    fields.forEach(f => {
      if (f.required && f.type !== 'checkbox' && (!form[f.name] || !String(form[f.name]).trim())) {
        errs[f.name] = `${f.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = transformPayload
        ? transformPayload(form)
        : { ...form, role, ...(role ? { password: '123456' } : {}) };
      await api.post(endpoint, payload);
      toast.success('Saved successfully');
      setForm({});
      setErrors({});
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${deleteTarget._id}`);
      toast.success('Deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (payload) => {
    setEditSaving(true);
    try {
      await api.patch(`${endpoint}/${editTarget._id}`, payload);
      toast.success('Updated successfully');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setEditSaving(false);
    }
  };

  const allColumns = [...columns, { key: '_actions', label: 'Actions' }];

  return (
    <div className="p-8">
      {deleteTarget && (
        <DeleteModal
          itemName={deleteTarget.name || deleteTarget._id}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          loading={deleting}
        />
      )}
      {editTarget && (
        <EditModal
          item={editTarget}
          fields={fields}
          onSave={handleEdit}
          onCancel={() => !editSaving && setEditTarget(null)}
          saving={editSaving}
        />
      )}

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
            {fields.map(f => {
              const errStyle = errors[f.name] ? { borderColor: '#ef4444' } : {};
              return (
                <div key={f.name}>
                  <label className="block text-[12px] font-medium text-txt-sub mb-1.5">
                    {f.label}{f.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
                  </label>
                  <FieldInput f={f} value={form[f.name]} onChange={v => setField(f.name, v)} errStyle={errStyle} />
                  {errors[f.name] && (
                    <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors[f.name]}</p>
                  )}
                </div>
              );
            })}
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
                  {allColumns.map(c => (
                    <th key={c.key} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={allColumns.length} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={allColumns.length} className="px-5 py-12 text-center text-txt-muted text-[13px]">No records found</td></tr>
                ) : (
                  items.map(item => (
                    <tr key={item._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      {columns.map(c => (
                        <td key={c.key} className="px-5 py-3.5 text-[13.5px] text-txt align-middle">
                          {c.render ? c.render(item) : (item[c.key] ?? '-')}
                        </td>
                      ))}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditTarget(item)}
                            className="p-1.5 rounded-lg text-txt-muted hover:text-accent hover:bg-accent/[0.1] transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {!isTrainer && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-txt-muted hover:text-red-400 hover:bg-red-500/[0.1] transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
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
