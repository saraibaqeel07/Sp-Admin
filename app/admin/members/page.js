"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Eye, X } from "lucide-react";
import api from "@/lib/api";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Roles } from "@/lib/constants";

const inputCls = "w-full px-3 py-2.5 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent transition-all placeholder:text-txt-muted";

const badge = (isActive) => isActive
  ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Active</span>
  : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">Inactive</span>;

function Avatar({ name, avatar }) {
  const initials = (name || "U").split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
  return avatar
    ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
    : <div className="w-8 h-8 rounded-full bg-accent/[0.12] border border-accent/[0.35] flex items-center justify-center text-accent text-[12px] font-semibold flex-shrink-0">{initials}</div>;
}

function ViewModal({ member, onClose }) {
  const name   = member.fullName || member.name || "-";
  const avatar = member.avatar || member.image || member.profileImage || member.photo || "";
  const d      = new Date(member.joinDate || member.createdAt);
  const joined = isNaN(d) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const Row = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-txt-muted uppercase tracking-[0.6px]">{label}</span>
      <span className="text-[13.5px] text-txt">{value || "-"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-txt">Member Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-white/[0.07] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-4 border-b border-white/[0.07]">
          {avatar
            ? <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            : <div className="w-14 h-14 rounded-full bg-accent/[0.12] border border-accent/[0.35] flex items-center justify-center text-accent text-[18px] font-semibold flex-shrink-0">
                {name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("")}
              </div>
          }
          <div>
            <p className="text-[16px] font-semibold text-txt">{name}</p>
            <p className="text-[13px] text-txt-muted mt-0.5">{member.email || "-"}</p>
          </div>
          <div className="ml-auto">{badge(member.isActive)}</div>
        </div>

        {/* Details grid */}
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <Row label="Phone"      value={member.phone} />
          <Row label="Join Date"  value={joined} />
          <Row label="Membership" value={member.membership?.name || member.membershipId?.name || member.membershipTier} />
          <Row label="Belt Level" value={member.beltLevel || member.belt?.name || member.beltId?.name} />
          <Row label="Role"       value={member.role} />
          <Row label="Member ID"  value={member._id} />
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full px-4 py-2.5 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ member, memberships, belts, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    fullName:      member.fullName || member.name || "",
    email:         member.email || "",
    contactNumber: member.contactNumber || member.phone || "",
    gender:        member.gender || "",
    membershipId:  member.membershipId?._id || member.membershipId || member.membership?._id || "",
    currentBeltId: member.currentBeltId?._id || member.currentBeltId || member.beltId?._id || member.beltId || "",
    password:      "",
    role:          member.role || "CLIENT",
    isActive:      member.isActive ?? true,
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.fullName?.trim()) { toast.error("Full name is required"); return; }
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={!saving ? onCancel : undefined}
    >
      <div className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
          <h3 className="text-[15px] font-semibold text-txt">Edit Member</h3>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Full Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input className={inputCls} value={form.fullName} onChange={e => setField("fullName", e.target.value)} placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Contact Number</label>
            <input className={inputCls} value={form.contactNumber} onChange={e => setField("contactNumber", e.target.value)} placeholder="+1234567890" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Gender</label>
            <select className={inputCls + " cursor-pointer"} value={form.gender} onChange={e => setField("gender", e.target.value)}>
              <option value="">Select gender</option>
              <option value="Male" className="bg-[#1c1c1c]">Male</option>
              <option value="Female" className="bg-[#1c1c1c]">Female</option>
            </select>
          </div>

          {memberships.length > 0 && (
            <div>
              <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Membership</label>
              <select className={inputCls + " cursor-pointer"} value={form.membershipId} onChange={e => setField("membershipId", e.target.value)}>
                <option value="">Select membership</option>
                {memberships.map(m => <option key={m._id} value={m._id} className="bg-[#1c1c1c]">{m.name}</option>)}
              </select>
            </div>
          )}

          {belts.length > 0 && (
            <div>
              <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Belt Level</label>
              <select className={inputCls + " cursor-pointer"} value={form.currentBeltId} onChange={e => setField("currentBeltId", e.target.value)}>
                <option value="">Select belt</option>
                {belts.map(b => <option key={b._id} value={b._id} className="bg-[#1c1c1c]">{b.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">New Password <span className="text-txt-muted">(leave blank to keep)</span></label>
            <input className={inputCls} type="password" value={form.password} onChange={e => setField("password", e.target.value)} placeholder="••••••••" />
          </div>

          <div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={!!form.isActive} onChange={e => setField("isActive", e.target.checked)} className="accent-accent w-4 h-4" />
              <span className="text-[13px] text-txt">Active</span>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : "Save Changes"}
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

const PAGE_SIZE = 10;

export default function Page() {
  const [items, setItems] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [belts, setBelts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    try {
      const [usersRes, membershipsRes, beltsRes] = await Promise.all([
        api.get("users", { params: { role: Roles.CLIENT } }),
        api.get("/admin/membership"),
        api.get("/belts"),
      ]);
      setItems(usersRes.data.data || []);
      setMemberships(membershipsRes.data.data || []);
      setBelts(Array.isArray(beltsRes.data) ? beltsRes.data : beltsRes.data.data || []);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = async (payload) => {
    setEditSaving(true);
    try {
      await api.patch(`/users/${editTarget._id}`, payload);
      toast.success("Member updated");
      setEditTarget(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminShell>
      {viewTarget && (
        <ViewModal member={viewTarget} onClose={() => setViewTarget(null)} />
      )}
      {editTarget && (
        <EditModal
          member={editTarget}
          memberships={memberships}
          belts={belts}
          onSave={handleEdit}
          onCancel={() => !editSaving && setEditTarget(null)}
          saving={editSaving}
        />
      )}

      <div className="p-8">
        <PageHeader title="Members Management" breadcrumb="Dashboard // Members" />

        <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                  {["Full Name", "Email", "Phone", "Membership", "Status", "Belt Level", "Join Date", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-txt-muted text-[13px]">Loading...</td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-txt-muted text-[13px]">No members found.</td></tr>
                ) : paged.map(i => {
                  const name = i.fullName || i.name || "-";
                  const avatar = i.avatar || i.image || i.profileImage || i.photo || "";
                  const d = new Date(i.joinDate || i.createdAt);
                  return (
                    <tr key={i._id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} avatar={avatar} />
                          <span className="font-medium text-txt text-[13.5px]">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt-sub align-middle">{i.email || "-"}</td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt align-middle">{i.contactNumber || "-"}</td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt align-middle">{i.membership?.name || i.membershipId?.name || i.membershipTier || "-"}</td>
                      <td className="px-5 py-3.5 align-middle">{badge(i.isActive)}</td>
                      <td className="px-5 py-3.5 text-[13.5px] text-txt align-middle">{i?.currentBeltId?.name || "-"}</td>
                      <td className="px-5 py-3.5 text-[13px] text-txt-sub align-middle">{isNaN(d) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewTarget(i)} className="p-1.5 rounded-lg text-txt-muted hover:text-accent hover:bg-accent/[0.1] transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setEditTarget(i)} className="p-1.5 rounded-lg text-txt-muted hover:text-accent hover:bg-accent/[0.1] transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-1.5 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-full border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm">‹</button>
            {[...Array(totalPages)].map((_, i) => {
              const n = i + 1;
              return (
                <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-full text-[12px] font-medium transition-colors flex items-center justify-center ${page === n ? "bg-accent text-[#0a0a0a]" : "border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover"}`}>{n}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-full border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm">›</button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
