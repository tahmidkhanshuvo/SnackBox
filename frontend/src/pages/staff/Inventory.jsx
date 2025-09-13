import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function Inventory({ goto }) {
  return (
    <StaffLayout title="Inventory Movements" goto={goto}>
      <p>Log Stock In/Out/Adjust and view ledger.</p>
    </StaffLayout>
  );
}
