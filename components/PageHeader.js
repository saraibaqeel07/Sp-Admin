"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PageHeader({ title, breadcrumb }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api.get("/notifications")
      .then(r => setCount(r.data?.count || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center justify-between mb-7">
      <div>
        <h1 className="text-[20px] font-semibold text-txt tracking-[-0.3px]">{title}</h1>
        {breadcrumb && <p className="text-[12px] text-txt-muted mt-0.5">{breadcrumb}</p>}
      </div>
      <div className="relative">
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-bg-hover border border-white/[0.12] flex items-center justify-center hover:bg-[#252525] transition-colors"
        >
          <img src="/assets/noti-icon.png" alt="" className="w-4 h-4" onError={e => { e.target.style.display = 'none'; }} />
        </button>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}
