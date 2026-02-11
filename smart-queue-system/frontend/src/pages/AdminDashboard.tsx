import React from 'react';
import Header from '../components/Header';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container p-4 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <AnalyticsCharts />
      </main>
    </div>
  );
};

export default AdminDashboard;
