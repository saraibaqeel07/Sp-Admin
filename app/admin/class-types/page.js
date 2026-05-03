"use client";
import AdminShell from '@/components/AdminShell';
import CrudPage from '@/components/CrudPage';
export default function Page(){ return <AdminShell><CrudPage title="Class Type Creation" endpoint="/class-types" fields={[{name:'name',label:'Class type name'}]} columns={[{key:'name',label:'Name'}]} /></AdminShell>; }
