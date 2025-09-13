import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function Shifts({ goto }) {
  return (
    <StaffLayout title="My Shifts" goto={goto}>
      <p>Upcoming & past shifts.</p>
    </StaffLayout>
  );
}
