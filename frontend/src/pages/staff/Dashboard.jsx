import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function Dashboard({ user, goto, onLogout }) {
  return (
    <StaffLayout title="Dashboard" goto={goto}>
      <p>Welcome, <strong>{user?.name}</strong>!</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12}}>
        <div style={{background:'#f8fafc', padding:16, borderRadius:12}}>Today’s Orders: —</div>
        <div style={{background:'#f8fafc', padding:16, borderRadius:12}}>Pending: —</div>
        <div style={{background:'#f8fafc', padding:16, borderRadius:12}}>Low Stock Alerts: —</div>
      </div>
      <button className="button-submit" onClick={onLogout} style={{marginTop:16}}>Logout</button>
    </StaffLayout>
  );
}
