"use client";
import AdminShell from '../../../components/AdminShell';
import CrudPage from '../../../components/CrudPage';

export default function TimeslotsPage() {
  return (
    <AdminShell>
      <CrudPage
        title="Timeslot Management"
        endpoint="timeslots"
        fields={[
          { name: "name", label: "Slot Name (e.g., Morning)" },
          { name: "startTime", label: "Start Time", type: "time" },
          { 
            name: "startPeriod", 
            label: "Start AM/PM", 
            type: "select", 
            options: [
              { label: "None", value: "" },
              { label: "AM", value: "AM" },
              { label: "PM", value: "PM" }
            ] 
          },
          { name: "endTime", label: "End Time", type: "time" },
          { 
            name: "endPeriod", 
            label: "End AM/PM", 
            type: "select", 
            options: [
              { label: "None", value: "" },
              { label: "AM", value: "AM" },
              { label: "PM", value: "PM" }
            ] 
          },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { 
            key: "time", 
            label: "Duration", 
            render: (item) => `${item.startTime} ${item.startPeriod} - ${item.endTime} ${item.endPeriod}` 
          },
        ]}
      />
    </AdminShell>
  );
}