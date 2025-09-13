import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function StaffProfile({ user, goto, onLogout }) {
  return (
    <StaffLayout title="My Profile" goto={goto}>
      <p>Name: <strong>{user?.name}</strong></p>
      <p>Email: <strong>{user?.email}</strong></p>
      <button className="button-submit" onClick={onLogout}>Logout</button>
    </StaffLayout>
  );
}
