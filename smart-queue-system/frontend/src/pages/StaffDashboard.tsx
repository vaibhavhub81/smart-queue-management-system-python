import React from 'react';
import Header from '../components/Header';
import QueueControl from '../components/staff/QueueControl';

const StaffDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container p-4 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Staff Dashboard</h1>
        <QueueControl />
      </main>
    </div>
  );
};

export default StaffDashboard;
