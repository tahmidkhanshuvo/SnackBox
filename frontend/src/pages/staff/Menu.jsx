import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function Menu({ goto }) {
  return (
    <StaffLayout title="Menu Items" goto={goto}>
      <p>Toggle availability; quick edit of price if permitted.</p>
    </StaffLayout>
  );
}
