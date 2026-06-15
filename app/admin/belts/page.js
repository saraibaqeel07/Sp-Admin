"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, Trash2, AlertTriangle, X } from "lucide-react";
import api from "@/lib/api";
import AdminShell from "@/components/AdminShell";
import Pagination from "@/components/Pagination";

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";
const smInputCls = "w-full px-2.5 py-2 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";
const EMPTY = { name: "", order: "", maxStripes: "", isActive: true, stripeRules: [] };

function validateBelt(form) {
  const e = {};
  if (!form.name?.trim())                    e.name       = "Belt name is required";
  if (!form.order || Number(form.order) < 1) e.order      = "Order is required";
  if (!form.maxStripes || Number(form.maxStripes) < 1) e.maxStripes = "Max stripes is required";
  return e;
}

function StripeRuleItem({ stripe, index, onRemove }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg">
      <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
        <span className="text-txt-muted">Stripe #<span className="text-txt font-medium">{stripe.stripeNumber}</span></span>
        <span className="text-txt-muted">Classes: <span className="text-txt font-medium">{stripe.requiredClasses}</span></span>
        <span className="text-txt-muted">Attendance: <span className="text-txt font-medium">{stripe.minAttendance}%</span></span>
        <span className="text-txt-muted flex items-center gap-1">Color: <span className="inline-block w-3 h-3 rounded-sm border border-white/20 flex-shrink-0" style={{ background: stripe.colorCode }} /><span className="text-txt font-medium">{stripe.colorCode}</span></span>
        <span className="text-txt-muted col-span-2 truncate">Notes: <span className="text-txt font-medium">{stripe.notes}</span></span>
      </div>
      <button onClick={() => onRemove(index)} className="p-1 rounded text-txt-muted hover:text-red-400 hover:bg-red-500/[0.1] transition-colors flex-shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

function AddStripeForm({ onAdd, onCancel }) {
  const [s, setS] = useState({ stripeNumber: "", requiredClasses: "", minAttendance: "", notes: "", colorCode: "#ffffff" });
  const [errs, setErrs] = useState({});

  const set = (k, v) => { setS(f => ({ ...f, [k]: v })); if (errs[k]) setErrs(e => ({ ...e, [k]: "" })); };

  const handle = () => {
    const e = {};
    if (!s.stripeNumber)                              e.stripeNumber    = "Required";
    if (!s.requiredClasses)                           e.requiredClasses = "Required";
    if (!s.minAttendance)                             e.minAttendance   = "Required";
    if (!s.notes?.trim())                             e.notes           = "Required";
    if (!s.colorCode?.trim())                         e.colorCode       = "Required";
    else if (!/^#[0-9a-fA-F]{6}$/.test(s.colorCode)) e.colorCode       = "Must be a valid hex color";
    if (Object.keys(e).length) { setErrs(e); return; }
    onAdd({ stripeNumber: Number(s.stripeNumber), requiredClasses: Number(s.requiredClasses), minAttendance: Number(s.minAttendance), notes: s.notes, colorCode: s.colorCode });
  };

  const field = (label, k, type = "number", placeholder, extra = {}) => (
    <div>
      <label className="block text-[11px] font-medium text-txt-muted mb-1">{label}</label>
      <input className={smInputCls} style={errs[k] ? { borderColor: "#ef4444" } : {}} type={type} value={s[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} {...extra} />
      {errs[k] && <p style={{ color: "#ef4444", fontSize: 10, marginTop: 2 }}>{errs[k]}</p>}
    </div>
  );

  return (
    <div className="p-3 bg-white/[0.03] border border-accent/[0.3] rounded-lg flex flex-col gap-3">
      <span className="text-[12px] font-semibold text-txt">New Stripe Rule</span>
      <div className="grid grid-cols-2 gap-2">
        {field("Stripe #",         "stripeNumber",    "number", "1")}
        {field("Required Classes", "requiredClasses", "number", "10")}
        {field("Min Attendance %", "minAttendance",   "number", "60")}
        <div>
          <label className="block text-[11px] font-medium text-txt-muted mb-1">Color Code</label>
          <div className="flex items-center gap-2">
            <input type="color" value={s.colorCode} onChange={e => set("colorCode", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-white/[0.12] bg-transparent flex-shrink-0" />
            <input className={smInputCls} style={errs.colorCode ? { borderColor: "#ef4444" } : {}} type="text" value={s.colorCode} onChange={e => set("colorCode", e.target.value)} placeholder="#ffffff" maxLength={7} />
          </div>
          {errs.colorCode && <p style={{ color: "#ef4444", fontSize: 10, marginTop: 2 }}>{errs.colorCode}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-medium text-txt-muted mb-1">Notes</label>
          <textarea
            className={smInputCls + " resize-none"}
            style={errs.notes ? { borderColor: "#ef4444" } : {}}
            value={s.notes}
            onChange={e => set("notes", e.target.value)}
            placeholder="Basic understanding..."
            maxLength={500}
            rows={4}
          />
          {errs.notes && <p style={{ color: "#ef4444", fontSize: 10, marginTop: 2 }}>{errs.notes}</p>}
        </div>
      </div>
      <div className="flex gap-2 mt-1">
        <button onClick={handle} className="flex-1 px-3 py-1.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[12px] font-semibold rounded-lg transition-colors">Add</button>
        <button onClick={onCancel} className="flex-1 px-3 py-1.5 bg-bg-hover border border-white/[0.12] text-txt text-[12px] rounded-lg hover:bg-bg-2 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function BeltForm({ form, setForm, errors, setErrors, onSubmit, saving, btnLabel }) {
  const [addingStripe, setAddingStripe] = useState(false);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors?.[k]) setErrors(e => ({ ...e, [k]: "" }));
  };

  const addStripe = (stripe) => {
    setForm(f => ({ ...f, stripeRules: [...(f.stripeRules || []), stripe] }));
    setAddingStripe(false);
  };

  const removeStripe = (idx) => {
    setForm(f => ({ ...f, stripeRules: f.stripeRules.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Belt Name <span style={{ color: "#ef4444" }}>*</span></label>
        <input className={inputCls} style={errors?.name ? { borderColor: "#ef4444" } : {}} value={form.name || ""} onChange={e => setField("name", e.target.value)} placeholder="e.g. White Belt" />
        {errors?.name && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Order <span style={{ color: "#ef4444" }}>*</span></label>
        <input className={inputCls} style={errors?.order ? { borderColor: "#ef4444" } : {}} type="number" min="1" value={form.order || ""} onChange={e => setField("order", e.target.value)} placeholder="e.g. 1" />
        {errors?.order && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.order}</p>}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Max Stripes <span style={{ color: "#ef4444" }}>*</span></label>
        <input className={inputCls} style={errors?.maxStripes ? { borderColor: "#ef4444" } : {}} type="number" min="1" value={form.maxStripes || ""} onChange={e => setField("maxStripes", e.target.value)} placeholder="e.g. 4" />
        {errors?.maxStripes && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{errors.maxStripes}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={!!form.isActive} onChange={e => setField("isActive", e.target.checked)} className="accent-accent w-4 h-4" />
          <span className="text-[13px] text-txt">Active</span>
        </label>
      </div>

      {/* Stripe Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium text-txt-sub">Stripe Rules <span className="text-txt-muted">(optional)</span></label>
          {!addingStripe && (
            <button onClick={() => setAddingStripe(true)} className="flex items-center gap-1 text-[11px] text-accent hover:underline">
              <Plus size={11} />Add Rule
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {(form.stripeRules || []).map((s, i) => (
            <StripeRuleItem key={i} stripe={s} index={i} onRemove={removeStripe} />
          ))}
          {addingStripe && <AddStripeForm onAdd={addStripe} onCancel={() => setAddingStripe(false)} />}
          {!addingStripe && (form.stripeRules || []).length === 0 && (
            <p className="text-[12px] text-txt-muted">No stripe rules added yet.</p>
          )}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={saving}
        className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {saving ? "Saving..." : btnLabel}
      </button>
    </div>
  );
}

function DeleteModal({ belt, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={!loading ? onCancel : undefined}>
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/[0.12] border border-red-500/[0.25] flex items-center justify-center text-red-400">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-txt">Delete Belt?</h3>
            <p className="text-[13px] text-txt-muted mt-1">Are you sure you want to delete <span className="text-txt font-medium">"{belt.name}"</span>? This cannot be undone.</p>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Deleting...</> : <><Trash2 size={14} />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ belt, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name:        belt.name || "",
    order:       belt.order || "",
    maxStripes:  belt.maxStripes || "",
    isActive:    belt.isActive ?? true,
    stripeRules: belt.stripeRules || [],
  });
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const errs = validateBelt(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, order: Number(form.order), maxStripes: Number(form.maxStripes) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={!saving ? onCancel : undefined}>
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
          <h3 className="text-[15px] font-semibold text-txt">Edit Belt</h3>
        </div>
        <div className="p-5 overflow-y-auto">
          <BeltForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={handleSave} saving={saving} btnLabel="Save Changes" />
        </div>
        <div className="px-5 pb-5 flex-shrink-0">
          <button onClick={onCancel} disabled={saving} className="w-full px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function BeltsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const load = async (p = page, ps = pageSize) => {
    try {
      const res = await api.get("/belts", { params: { page: p, limit: ps } });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setItems(data);
      const meta = res.data.meta || {};
      setTotal(meta.total ?? data.length);
      setTotalPages(meta.totalPages ?? 1);
    } catch {
      toast.error("Failed to load belts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, pageSize); }, [page, pageSize]);

  const submit = (e) => {
    e?.preventDefault?.();
    const errs = validateBelt(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    api.post("/belts", { ...form, order: Number(form.order), maxStripes: Number(form.maxStripes) })
      .then(() => { toast.success("Belt created"); setForm({ ...EMPTY }); setErrors({}); setPage(1); load(1, pageSize); })
      .catch(err => toast.error(err?.response?.data?.message || "Failed to save"))
      .finally(() => setSaving(false));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/belts/${deleteTarget._id}`);
      toast.success("Belt deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (updated) => {
    setEditSaving(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { _id, createdAt, updatedAt, deletedAt, __v, ...payload } = updated;
      await api.patch(`/belts/${editTarget._id}`, payload);
      toast.success("Belt updated");
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <AdminShell>
      {deleteTarget && (
        <DeleteModal belt={deleteTarget} onConfirm={handleDelete} onCancel={() => !deleting && setDeleteTarget(null)} loading={deleting} />
      )}
      {editTarget && (
        <EditModal belt={editTarget} onSave={handleEdit} onCancel={() => !editSaving && setEditTarget(null)} saving={editSaving} />
      )}

      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Belt Management</h1>
          <p className="text-[13px] text-txt-muted mt-1">Create and manage belt levels</p>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: "320px 1fr", alignItems: "start" }}>
          {/* Form */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07]">
              <span className="text-[14px] font-semibold text-txt">Add New Belt</span>
            </div>
            <form onSubmit={submit} className="p-5">
              <BeltForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSubmit={submit} saving={saving} btnLabel="Add Belt" />
            </form>
          </div>

          {/* Table */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-txt">Belt List</span>
              <span className="text-[12px] text-txt-muted">{total} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                    {["Name", "Order", "Max Stripes", "Stripe Rules", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-txt-muted text-[13px]">No belts found</td></tr>
                  ) : items.map(item => (
                    <tr key={item._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5 text-[13.5px] text-txt font-medium">{item.name}</td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt">#{item.order}</td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt">{item.maxStripes ?? "-"}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">
                          {item.stripeRules?.length || 0} rules
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {item.isActive
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Active</span>
                          : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">Inactive</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditTarget(item)} className="p-1.5 rounded-lg text-txt-muted hover:text-accent hover:bg-accent/[0.1] transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-txt-muted hover:text-red-400 hover:bg-red-500/[0.1] transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
      </div>
    </AdminShell>
  );
}
