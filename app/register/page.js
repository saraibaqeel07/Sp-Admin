"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
export default function Register(){
 const [memberships,setMemberships]=useState([]); const [form,setForm]=useState({}); const router=useRouter();
 useEffect(()=>{ api.get('/memberships').then(r=>setMemberships(r.data.data||[])); },[]);
 const submit=async(e)=>{ e.preventDefault(); await api.post('/auth/register', form); router.push('/login'); };
 return <div className="container" style={{maxWidth:520}}><div className="card"><h1>Member Registration</h1><form onSubmit={submit}>
 <label className="label">Name<input className="input" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></label>
 <label className="label">Email<input className="input" type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})}/></label>
 <label className="label">Phone<input className="input" value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
 <label className="label">Password<input className="input" type="password" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})}/></label>
 <label className="label">Membership<select className="select" value={form.membership||''} onChange={e=>setForm({...form,membership:e.target.value})}><option value="">Select membership</option>{memberships.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}</select></label>
 <button className="btn">Create account</button></form></div></div>
}
