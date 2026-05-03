"use client";
import AdminShell from "@/components/AdminShell";
import CrudPage from "@/components/CrudPage";
export default function Page() {
  return (
    <AdminShell>
      <CrudPage
        title="Membership Subscription Management"
        endpoint="/admin/membership"
        fields={[
          { name: "name", label: "Membership name" },
          { name: "price", label: "Price", type: "number" },
          { name: "description", label: "Description" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "price", label: "Price" },
          { key: "description", label: "Description" },
        ]}
      />
    </AdminShell>
  );
}
