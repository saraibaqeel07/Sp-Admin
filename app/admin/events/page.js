"use client";
import { useState } from "react";
import { X, Users } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import CrudPage from "@/components/CrudPage";

function AttendeesModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-[15px] font-semibold text-txt">{event.title}</h2>
            <p className="text-[12px] text-txt-muted mt-0.5">Registered attendees</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-muted hover:text-txt hover:bg-white/[0.07] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
          {!event.attendees?.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
                <Users size={20} className="text-txt-muted" />
              </div>
              <p className="text-txt-muted text-[13px]">No members registered yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {event.attendees.map((u, idx) => {
                const name = u.fullName || u.name || "Unknown";
                const initials = name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("") || "U";
                return (
                  <div
                    key={u._id || idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-accent/[0.12] border border-accent/[0.25] flex items-center justify-center text-accent text-[12px] font-semibold flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium text-txt">{name}</div>
                      <div className="text-[11px] text-txt-muted mt-0.5">{u.email || "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-between">
          <span className="text-[12px] text-txt-muted">
            {event.attendees?.length || 0} member{event.attendees?.length !== 1 ? "s" : ""} registered
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-hover border border-white/[0.12] text-txt text-[13px] font-medium rounded-lg hover:bg-bg-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventsManagementPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <AdminShell>
      <AttendeesModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <CrudPage
        title="Events Management"
        endpoint="events/admin"
        fields={[
          { name: "title",      label: "Event Title" },
          { name: "type",       label: "Event Type", type: "select", options: [{ label: "Gi Seminar", value: "Gi Seminar" }, { label: "No-Gi Workshop", value: "No-Gi Workshop" }] },
          { name: "date",       label: "Date",       type: "date" },
          { name: "startTime",  label: "Start Time", type: "time" },
          { name: "endTime",    label: "End Time",   type: "time" },
          { name: "venue",      label: "Venue" },
          { name: "guestCoach", label: "Guest Coach" },
        ]}
        columns={[
          { key: "title", label: "Event Name" },
          { key: "date",  label: "Date", render: item => new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
          {
            key: "attendees",
            label: "Registered",
            render: item => (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400">
                {item.attendees?.length || 0} members
              </span>
            ),
          },
          {
            key: "actions",
            label: "Attendees",
            render: item => (
              <button
                onClick={() => setSelectedEvent(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-hover border border-white/[0.12] text-txt text-[12px] font-medium rounded-lg hover:bg-bg-2 transition-colors"
              >
                <Users size={12} />
                View List
              </button>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
