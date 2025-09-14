import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function Salaries({ goto }) {
  return (
    <StaffLayout title="My Salaries" goto={goto}>
      <p>Salary slips/history.</p>
    </StaffLayout>
  );
}
