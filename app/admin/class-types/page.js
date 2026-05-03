"use client";
import AdminShell from "@/components/AdminShell";
import CrudPage from "@/components/CrudPage";

export default function ClassTypesPage() {
  return (
    <AdminShell>
      <CrudPage
        title="Class Types"
        subtitle="Create and manage class type definitions"
        endpoint="/admin/class-types"
        fields={[
          { name: "name",            label: "Name",             required: true,  placeholder: "e.g. Brazilian Jiu-Jitsu" },
          { name: "description",     label: "Description",      required: true,  placeholder: "e.g. Ground-based martial arts..." },
          { name: "defaultCapacity", label: "Default Capacity", required: true,  type: "number", placeholder: "e.g. 30" },
          { name: "isActive",        label: "Active",           type: "checkbox", checkboxLabel: "Active" },
        ]}
        columns={[
          { key: "name",            label: "Name" },
          { key: "description",     label: "Description" },
          { key: "defaultCapacity", label: "Default Capacity" },
          {
            key: "isActive",
            label: "Status",
            render: (i) => i.isActive
              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400">Active</span>
              : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.07] text-txt-sub">Inactive</span>,
          },
        ]}
        transformPayload={(form) => ({
          name:            form.name,
          description:     form.description,
          defaultCapacity: Number(form.defaultCapacity),
          isActive:        !!form.isActive,
        })}
      />
    </AdminShell>
  );
}
