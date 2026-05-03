"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MemberDashboard() {
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const parsedUser = JSON.parse(localStorage.getItem('memberUser') || 'null');
        setUser(parsedUser);
        const classesRes = await api.get('/classes/public/list');
        setClasses(classesRes.data.data || []);
        try {
          const walletRes = await api.get('/wallet');
          setWallet(walletRes.data.data || []);
        } catch {
          setWallet([]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load member dashboard');
      }
    };
    run();
  }, []);

  const book = async (classRef, timeSlot) => {
    try {
      await api.post('admin/bookings', { user: user._id, classRef, timeSlot });
      alert('Booking submitted');
    } catch (err) {
      alert(err?.response?.data?.message || 'Booking failed');
    }
  };

  const referral = async () => {
    const referredName = prompt('Referred name');
    const referredEmail = prompt('Referred email');
    if (!referredName || !referredEmail || !user?._id) return;
    try {
      await api.post('/referrals', { referrer: user._id, referredName, referredEmail });
      alert('Referral submitted');
    } catch (err) {
      alert(err?.response?.data?.message || 'Referral failed');
    }
  };

  const redeem = async () => {
    const amount = prompt('Redeem amount');
    if (!amount || !user?._id) return;
    try {
      await api.post('/wallet/redeem-request', { user: user._id, amount: Number(amount), note: 'Member request' });
      alert('Redeem request submitted');
    } catch (err) {
      alert(err?.response?.data?.message || 'Redeem request failed');
    }
  };

  if (!user) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Welcome, {user.name}</h1>
      {error ? <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p> : null}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="card"><h3>Membership</h3><p>{user.membership?.name || 'Not assigned'}</p><p>Status: {user.membershipStatus}</p></div>
        <div className="card"><h3>Wallet</h3><p>${user.wallet || 0}</p><p>Transactions: {wallet.length}</p><button className="btn" onClick={redeem}>Request Redemption</button></div>
        <div className="card"><h3>Referral</h3><p>Invite new members and earn rewards.</p><button className="btn" onClick={referral}>Submit Referral</button></div>
      </div>
      <div className="section">
        <h2>Book Classes</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          {classes.map((c) => (
            <div className="card" key={c._id}>
              <h3>{c.name}</h3>
              <p>{c.classType?.name}</p>
              {(c.timeSlots || []).map((slot) => (
                <button key={slot._id} className="btn" style={{ display: 'block', marginTop: 8 }} onClick={() => book(c._id, slot._id)}>
                  Book {slot.startTime}-{slot.endTime}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
