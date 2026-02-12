import React, { useState } from 'react';
import Header from '../components/Header';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';
import UserManagement from '../components/admin/UserManagement';
import ServiceManagement from '../components/admin/ServiceManagement';

type Tab = 'analytics' | 'users' | 'services';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsCharts />;
      case 'users':
        return <UserManagement />;
      case 'services':
        return <ServiceManagement />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === tabName
                ? 'text-white bg-indigo-600'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container p-4 mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg">
                <TabButton tabName="analytics" label="Analytics" />
                <TabButton tabName="users" label="User Management" />
                <TabButton tabName="services" label="Service Management" />
            </div>
        </div>
        
        <div>
            {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
