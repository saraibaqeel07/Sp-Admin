"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.setItem('memberToken', res.data.token);
      localStorage.setItem('memberUser', JSON.stringify(res.data.user));
      router.push('/member');
    } catch (err) {
      setError(err?.response?.data?.message || 'Member login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <h1>Member Login</h1>
        {error ? <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p> : null}
        <form onSubmit={submit}>
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label className="label">
            Password
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
