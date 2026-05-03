"use client";
import AdminShell from "@/components/AdminShell";
import CrudPage from "@/components/CrudPage";
import { Roles } from "@/lib/constants";
export default function Page() {
  return (
    <AdminShell>
      <CrudPage
      role={Roles.TRAINER}
        title="Coach / Trainer Management"
        endpoint="users"
        fields={[
          { name: "fullName", label: "Name" },
          { name: "email", label: "Email", type: "email" },
          { name: "gender", label: "Gender" },
          { name: "contactNumber", label: "Contact Number" },
        ]}
        columns={[
          { key: "fullName", label: "Name" },
          { key: "email", label: "Email" },
          { key: "gender", label: "Gender" },
          { key: "contactNumber", label: "Contact" },
        ]}
      />
    </AdminShell>
  );
}
