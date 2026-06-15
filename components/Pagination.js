export default function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange, total }) {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.07]">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-txt-muted">Rows per page:</span>
        <select
          value={pageSize}
          onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="px-2.5 py-1 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[12px] outline-none focus:border-accent cursor-pointer"
        >
          {[10, 20, 50].map(n => <option key={n} value={n} className="bg-[#1c1c1c]">{n}</option>)}
        </select>
        {total !== undefined && (
          <span className="text-[12px] text-txt-muted ml-1">{total} total</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded-full border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
        >‹</button>
        {pages.map((n, i) =>
          n === '...'
            ? <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-txt-muted text-[12px]">…</span>
            : <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`w-8 h-8 rounded-full text-[12px] font-medium transition-colors flex items-center justify-center ${page === n ? 'bg-accent text-[#0a0a0a]' : 'border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover'}`}
              >{n}</button>
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="w-8 h-8 rounded-full border border-white/[0.12] text-txt-sub hover:text-txt hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
        >›</button>
      </div>
    </div>
  );
}
