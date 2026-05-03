"use client";

const variants = {
  primary: "bg-accent hover:bg-accent-h text-[#0a0a0a]",
  outline: "bg-transparent text-txt border border-white/[0.12] hover:bg-bg-hover",
  danger:  "bg-red-500 hover:bg-red-600 text-white",
};

export default function Button({ children, onClick, href, className = "", variant = "primary", type = "button", ...props }) {
  const cls = `inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap ${variants[variant] || variants.primary} ${className}`;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button type={type} onClick={onClick} className={cls} {...props}>{children}</button>;
}
