"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Table({ data = [], fetchData, columns = [], pageSize = 10 }) {
  const router = useRouter();
  const [items, setItems] = useState(data);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!fetchData) return;
    fetchData()
      .then(r => setItems(r || []))
      .catch(err => setError(err?.message || "Failed to load data"));
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {error && <p className="text-red-400 text-[13px] mb-3">{error}</p>}

      <div className="bg-bg-card border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.07]">
                {columns.map(col => (
                  <th key={col.key} className="px-5 py-3 text-left text-[10.5px] font-semibold text-txt-muted uppercase tracking-[0.8px] whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length ? (
                paged.map(row => (
                  <tr key={row._id || row.id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.018] transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-5 py-3.5 text-[13.5px] text-txt align-middle">
                        {col.render ? col.render(row, router) : (row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-txt-muted text-[13px]">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-1.5 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
          >‹</button>
          {[...Array(totalPages)].map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-full text-[12px] font-medium transition-colors flex items-center justify-center ${
                  page === n
                    ? 'bg-accent text-[#0a0a0a]'
                    : 'border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover'
                }`}
              >{n}</button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
          >›</button>
        </div>
      )}
    </div>
  );
}
