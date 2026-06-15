"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import AdminShell from "@/components/AdminShell";
import Pagination from "@/components/Pagination";
import { Roles } from "@/lib/constants";

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";
const EMPTY_FORM = { name: "", allowedMembershipIds: [], timeslotId: "", coachId: "", classTypeId: "", capacity: "", date: "" };

function normalizeForForm(item) {
  return {
    ...item,
    classTypeId: item.classTypeId?._id || item.classTypeId || "",
    coachId: item.coachId?._id || item.coachId || "",
    timeslotId: item.timeslotId?._id || item.timeslotId || "",
    allowedMembershipIds: (item.allowedMembershipIds || []).map(m => m?._id || m),
    date: item.date ? item.date.slice(0, 10) : "",
    capacity: item.capacity ?? "",
  };
}

function validateForm(form) {
  const errs = {};
  if (!form.name?.trim())                              errs.name                = 'Class Name is required';
  if (!form.classTypeId)                               errs.classTypeId         = 'Class Type is required';
  if (!form.capacity || Number(form.capacity) <= 0)    errs.capacity            = 'Capacity must be greater than 0';
  if (!form.coachId)                                   errs.coachId             = 'Trainer is required';
  if (!form.date)                                      errs.date                = 'Date is required';
  if (!form.timeslotId)                                errs.timeslotId          = 'Time Slot is required';
  if (!form.allowedMembershipIds?.length)              errs.allowedMembershipIds = 'Select at least one membership';
  return errs;
}

function ClassForm({ form, setForm, errors, slots, types, trainers, memberships }) {
  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggle = (val) => {
    setForm(f => ({
      ...f,
      allowedMembershipIds: f.allowedMembershipIds?.includes(val)
        ? f.allowedMembershipIds.filter(v => v !== val)
        : [...(f.allowedMembershipIds || []), val],
    }));
  };

  return (
    <>
      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Class Name <span style={{ color: '#ef4444' }}>*</span></label>
        <input className={inputCls} style={errors.name ? { borderColor: '#ef4444' } : {}} value={form.name || ""} onChange={e => setField('name', e.target.value)} placeholder="e.g. Morning BJJ" />
        {errors.name && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Class Type <span style={{ color: '#ef4444' }}>*</span></label>
        <select className={inputCls + " cursor-pointer"} style={errors.classTypeId ? { borderColor: '#ef4444' } : {}} value={form.classTypeId || ""} onChange={e => setField('classTypeId', e.target.value)}>
          <option value="">Select type</option>
          {types.map(t => <option key={t._id} value={t._id} className="bg-[#1c1c1c]">{t.name}</option>)}
        </select>
        {errors.classTypeId && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.classTypeId}</p>}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Capacity <span style={{ color: '#ef4444' }}>*</span></label>
        <input className={inputCls} style={errors.capacity ? { borderColor: '#ef4444' } : {}} type="number" min="1" value={form.capacity || ""} onChange={e => setField('capacity', e.target.value)} placeholder="e.g. 20" />
        {errors.capacity && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.capacity}</p>}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Trainer <span style={{ color: '#ef4444' }}>*</span></label>
        <select className={inputCls + " cursor-pointer"} style={errors.coachId ? { borderColor: '#ef4444' } : {}} value={form.coachId || ""} onChange={e => setField('coachId', e.target.value)}>
          <option value="">Select trainer</option>
          {trainers.map(t => <option key={t._id} value={t._id} className="bg-[#1c1c1c]">{t.fullName}</option>)}
        </select>
        {errors.coachId && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.coachId}</p>}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Date <span style={{ color: '#ef4444' }}>*</span></label>
        <input className={inputCls} style={errors.date ? { borderColor: '#ef4444' } : {}} type="date" value={form.date || ""} onChange={e => setField('date', e.target.value)} />
        {errors.date && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.date}</p>}
      </div>

      {slots.length > 0 && (
        <div>
          <label className="block text-[12px] font-medium text-txt-sub mb-2">Time Slot <span style={{ color: '#ef4444' }}>*</span></label>
          <div className="flex flex-col gap-2">
            {slots.map(s => (
              <label key={s._id} className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="timeslot" value={s._id} checked={form.timeslotId === s._id} onChange={e => setField('timeslotId', e.target.value)} className="accent-accent w-3.5 h-3.5" />
                <span className="text-[13px] text-txt">{s.name} <span className="text-txt-muted">({s.startTime} - {s.endTime})</span></span>
              </label>
            ))}
          </div>
          {errors.timeslotId && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.timeslotId}</p>}
        </div>
      )}

      {memberships.length > 0 && (
        <div>
          <label className="block text-[12px] font-medium text-txt-sub mb-2">Membership Access <span style={{ color: '#ef4444' }}>*</span></label>
          <div className="flex flex-col gap-2">
            {memberships.map(m => (
              <label key={m._id} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.allowedMembershipIds?.includes(m._id)} onChange={() => toggle(m._id)} className="accent-accent w-3.5 h-3.5" />
                <span className="text-[13px] text-txt">{m.name}</span>
              </label>
            ))}
          </div>
          {errors.allowedMembershipIds && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.allowedMembershipIds}</p>}
        </div>
      )}
    </>
  );
}

function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={!loading ? onCancel : undefined}>
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/[0.12] border border-red-500/[0.25] flex items-center justify-center text-red-400">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-txt">Delete Class?</h3>
            <p className="text-[13px] text-txt-muted mt-1">Are you sure you want to delete <span className="text-txt font-medium">"{item.name || 'this class'}"</span>? This cannot be undone.</p>
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

function EditModal({ item, types, slots, trainers, memberships, onSave, onCancel, saving }) {
  const [form, setForm] = useState(normalizeForForm(item));
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const { _id, createdAt, updatedAt, deletedAt, __v, name, timeslotId, allowedMembershipIds, bookedCount, ...payload } = form;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={!saving ? onCancel : undefined}>
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
          <h3 className="text-[15px] font-semibold text-txt">Edit Class</h3>
        </div>
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <ClassForm form={form} setForm={setForm} errors={errors} slots={slots} types={types} trainers={trainers} memberships={memberships} />
          <button onClick={handleSave} disabled={saving} className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </div>
        <div className="px-5 pb-5 flex-shrink-0">
          <button onClick={onCancel} disabled={saving} className="w-full px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [types, setTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const load = async (p = page, ps = pageSize) => {
    try {
      setError("");
      const [classesRes, typesRes, slotsRes, membershipsRes, trainersRes] = await Promise.all([
        api.get("/admin/slots", { params: { page: p, limit: ps } }),
        api.get("/admin/class-types"),
        api.get("/timeslots"),
        api.get("/admin/membership"),
        api.get("/users", { params: { role: Roles.TRAINER } }),
      ]);
      const data = classesRes?.data?.data || [];
      setItems(data);
      const meta = classesRes?.data?.meta || {};
      setTotal(meta.total ?? data.length);
      setTotalPages(meta.totalPages ?? 1);
      setTypes(typesRes?.data?.data || []);
      setSlots(slotsRes?.data?.data || []);
      setMemberships(membershipsRes?.data?.data || []);
      setTrainers(trainersRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load classes");
    }
  };

  useEffect(() => { load(page, pageSize); }, [page, pageSize]);

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const toggle = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key]?.includes(val) ? prev[key].filter(v => v !== val) : [...(prev[key] || []), val],
    }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await api.post("/admin/slots", form);
      toast.success("Class saved");
      setForm({ ...EMPTY_FORM });
      setErrors({});
      setPage(1);
      await load(1, pageSize);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/slots/${deleteTarget._id}`);
      toast.success("Class deleted");
      setDeleteTarget(null);
      const newPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      await load(newPage, pageSize);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (payload) => {
    setEditSaving(true);
    try {
      await api.patch(`/admin/slots/${editTarget._id}`, payload);
      toast.success("Class updated");
      setEditTarget(null);
      await load(page, pageSize);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <AdminShell>
      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => !deleting && setDeleteTarget(null)} loading={deleting} />
      )}
      {editTarget && (
        <EditModal item={editTarget} types={types} slots={slots} trainers={trainers} memberships={memberships} onSave={handleEdit} onCancel={() => !editSaving && setEditTarget(null)} saving={editSaving} />
      )}

      <div className="p-8">
        <div className="mb-7">
          <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">Class Schedule</h1>
          <p className="text-[13px] text-txt-muted mt-1">Create and manage class slots</p>
        </div>

        {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}

        <div className="grid gap-5" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
          {/* Form */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07]">
              <span className="text-[14px] font-semibold text-txt">New Class</span>
            </div>
            <form onSubmit={submit} className="p-5 flex flex-col gap-4">
              <ClassForm form={form} setForm={setForm} errors={errors} slots={slots} types={types} trainers={trainers} memberships={memberships} />
              <button className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed" type="submit" disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {saving ? 'Saving...' : 'Save Class'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-txt">Class List</span>
              <span className="text-[12px] text-txt-muted">{total} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                    {['Name', 'Type', 'Date', 'Capacity', 'Trainer', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-txt-muted text-[13px]">No classes found</td></tr>
                  ) : (
                    items.map(i => (
                      <tr key={i._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                        <td className="px-5 py-3.5 text-[13.5px] text-txt font-medium">{i.name || `${i?.startTime} - ${i?.endTime}`}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.classTypeId?.name || "-"}</td>
                        <td className="px-5 py-3.5 text-[13px] text-txt-sub">{i.date ? new Date(i.date).toLocaleDateString("en-GB") : "-"}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.capacity}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.coachId?.fullName || "-"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditTarget(i)} className="p-1.5 rounded-lg text-txt-muted hover:text-accent hover:bg-accent/[0.1] transition-colors" title="Edit">
                              <Pencil size={14} />
                            </button>
                            {/* <button onClick={() => setDeleteTarget(i)} className="p-1.5 rounded-lg text-txt-muted hover:text-red-400 hover:bg-red-500/[0.1] transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button> */}
                          </div>
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
      </div>
    </AdminShell>
  );
}
