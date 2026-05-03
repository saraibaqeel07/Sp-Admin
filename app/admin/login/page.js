"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const inputCls = "w-full px-3.5 py-3 bg-bg-2 border border-white/[0.12] rounded-lg text-txt text-[13.5px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-txt-muted";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.removeItem('memberToken');
      localStorage.removeItem('memberUser');
      localStorage.setItem('adminToken', res.data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      document.cookie = `adminToken=${res.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
      toast.success('Welcome back!');
      router.push('/admin');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6"
      style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.03) 0%, transparent 45%)' }}>
      <div className="w-full max-w-[380px] bg-bg-card border border-white/[0.12] rounded-2xl p-9">
        <div className="text-center mb-8">
          <img src="/logo.webp" alt="Six Point" className="h-16 w-auto mx-auto mb-4" />
          <div className="text-[20px] font-bold text-txt tracking-[-0.3px]">Six Point</div>
          <div className="text-[11px] text-txt-muted uppercase tracking-[1.5px] mt-1">Admin Portal</div>
        </div>

        <div className="h-px bg-white/[0.07] mb-7" />

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Email Address</label>
            <input
              className={inputCls}
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-txt-sub mb-1.5">Password</label>
            <input
              className={inputCls}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-h text-[#0a0a0a] text-[14px] font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
