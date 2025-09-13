import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function Complaints({ goto }) {
  return (
    <StaffLayout title="Complaints" goto={goto}>
      <p>Assigned complaints list; update status and add response.</p>
    </StaffLayout>
  );
}
