import React from 'react';
import StaffLayout from './StaffLayout.jsx';

export default function ComplaintDetails({ complaintId, goto }) {
  return (
    <StaffLayout title={`Complaint #${complaintId}`} goto={goto}>
      <p>Conversation thread and status changes.</p>
    </StaffLayout>
  );
}
