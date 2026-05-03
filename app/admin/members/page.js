"use client";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import Table from "@/components/Table";
import { Roles } from "@/lib/constants";

const badge = (isActive) => isActive
  ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Active</span>
  : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">Inactive</span>;

const columns = [
  {
    key: "name",
    label: "Full Name",
    render: (i) => {
      const name = i.name || i.fullName || "-";
      const avatar = i.avatar || i.image || i.profileImage || i.photo || "";
      const initials = name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("") || "U";
      return (
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent/[0.12] border border-accent/[0.35] flex items-center justify-center text-accent text-[12px] font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          <span className="font-medium text-txt">{name}</span>
        </div>
      );
    },
  },
  { key: "email",      label: "Email",      render: i => <span className="text-txt-sub">{i.email || "-"}</span> },
  { key: "phone",      label: "Phone",      render: i => i.phone || "-" },
  { key: "membership", label: "Membership", render: i => i.membership?.name || i.membershipId?.name || i.membershipTier || "-" },
  { key: "status",     label: "Status",     render: i => badge(i.isActive) },
  { key: "belt",       label: "Belt Level", render: i => i.beltLevel || i.belt || "-" },
  {
    key: "joinDate",
    label: "Join Date",
    render: i => {
      const d = new Date(i.joinDate || i.createdAt);
      return isNaN(d) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    },
  },
  {
    key: "actions",
    label: "Actions",
    render: (i, router) => (
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => router.push(`/admin/members/${i._id}`)}
          className="p-1 rounded hover:bg-white/[0.07] transition-colors"
          title="View"
        >
          <img src="/assets/view-icon.png" alt="View" className="w-[18px] h-[18px]" />
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/members/${i._id}/edit`)}
          className="p-1 rounded hover:bg-white/[0.07] transition-colors"
          title="Edit"
        >
          <img src="/assets/edit-icon.png" alt="Edit" className="w-[18px] h-[18px]" />
        </button>
      </div>
    ),
  },
];

export default function Page() {
  return (
    <AdminShell>
      <div className="p-8">
        <PageHeader title="Members Management" breadcrumb="Dashboard // Members" />
        <Table
          fetchData={async () => {
            const res = await api.get("users", { role: Roles.CLIENT });
            return res.data.data;
          }}
          columns={columns}
        />
      </div>
    </AdminShell>
  );
}
