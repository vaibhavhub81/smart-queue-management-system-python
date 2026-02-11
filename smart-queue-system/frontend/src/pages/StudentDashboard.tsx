import React from 'react';
import Header from '../components/Header';
import ServiceList from '../components/student/ServiceList';
import MyQueueStatus from '../components/student/MyQueueStatus';

const StudentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container p-4 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ServiceList />
          </div>
          <div>
            <MyQueueStatus />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
