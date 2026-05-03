"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import AdminShell from "@/components/AdminShell";
import { Roles } from "@/lib/constants";

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";

export default function Page() {
  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({ allowedMembershipIds: [], timeslotId: "", coachId: "", classTypeId: "", capacity: 0, date: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError("");
      const [classesRes, typesRes, slotsRes, membershipsRes, trainersRes] = await Promise.all([
        api.get("/admin/slots"),
        api.get("/admin/class-types"),
        api.get("/timeslots"),
        api.get("/admin/membership"),
        api.get("/users", { params: { role: Roles.TRAINER } }),
      ]);
      setItems(classesRes?.data?.data || []);
      setTypes(typesRes?.data?.data || []);
      setSlots(slotsRes?.data?.data || []);
      setMemberships(membershipsRes?.data?.data || []);
      setTrainers(trainersRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load classes");
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key]?.includes(val) ? prev[key].filter(v => v !== val) : [...(prev[key] || []), val],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/slots", form);
      toast.success("Class saved");
      setForm({ allowedMembershipIds: [], timeslotId: "", coachId: "", classTypeId: "", capacity: 0, date: "" });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
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
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Class Name</label>
                <input className={inputCls} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning BJJ" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Class Type</label>
                <select className={inputCls + " cursor-pointer"} value={form.classTypeId || ""} onChange={e => setForm({ ...form, classTypeId: e.target.value })}>
                  <option value="">Select type</option>
                  {types.map(t => <option key={t._id} value={t._id} className="bg-[#1c1c1c]">{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Capacity</label>
                <input className={inputCls} type="number" value={form.capacity || ""} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 20" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Trainer</label>
                <select className={inputCls + " cursor-pointer"} value={form.coachId || ""} onChange={e => setForm({ ...form, coachId: e.target.value })}>
                  <option value="">Select trainer</option>
                  {trainers.map(t => <option key={t._id} value={t._id} className="bg-[#1c1c1c]">{t.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Date</label>
                <input className={inputCls} type="date" value={form.date || ""} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>

              {slots.length > 0 && (
                <div>
                  <label className="block text-[12px] font-medium text-txt-sub mb-2">Time Slot</label>
                  <div className="flex flex-col gap-2">
                    {slots.map(s => (
                      <label key={s._id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="timeslot"
                          value={s._id}
                          checked={form.timeslotId === s._id}
                          onChange={e => setForm({ ...form, timeslotId: e.target.value })}
                          className="accent-accent w-3.5 h-3.5"
                        />
                        <span className="text-[13px] text-txt">{s.name} <span className="text-txt-muted">({s.startTime} - {s.endTime})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {memberships.length > 0 && (
                <div>
                  <label className="block text-[12px] font-medium text-txt-sub mb-2">Membership Access</label>
                  <div className="flex flex-col gap-2">
                    {memberships.map(m => (
                      <label key={m._id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.allowedMembershipIds?.includes(m._id)}
                          onChange={() => toggle("allowedMembershipIds", m._id)}
                          className="accent-accent w-3.5 h-3.5"
                        />
                        <span className="text-[13px] text-txt">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                type="submit"
                disabled={saving}
              >
                <Plus size={14} />
                {saving ? 'Saving...' : 'Save Class'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-txt">Class List</span>
              <span className="text-[12px] text-txt-muted">{items.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                    {['Name', 'Type', 'Date', 'Capacity', 'Trainer'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-txt-muted text-[13px]">No classes found</td></tr>
                  ) : (
                    items.map(i => (
                      <tr key={i._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                        <td className="px-5 py-3.5 text-[13.5px] text-txt font-medium">{i.name || `${i?.startTime} - ${i?.endTime}`}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.classTypeId?.name || "-"}</td>
                        <td className="px-5 py-3.5 text-[13px] text-txt-sub">{i.date ? new Date(i.date).toLocaleDateString("en-GB") : "-"}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.capacity}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-txt">{i.coachId?.fullName || "-"}</td>
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
