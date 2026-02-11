import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServiceAnalytics {
    service_id: number;
    service_name: string;
    total_users: number;
    completed_users: number;
    skipped_users: number;
    average_wait_time: string; // Format: "HH:MM:SS"
}

const fetchAnalytics = async (): Promise<ServiceAnalytics[]> => {
    const { data } = await api.get('/analytics/services/');
    return data;
};

// Helper to convert "HH:MM:SS" to minutes
const durationToMinutes = (duration: string) => {
    if(!duration) return 0;
    const parts = duration.split(':').map(Number);
    if(parts.length === 3){
        return parts[0] * 60 + parts[1] + parts[2] / 60;
    }
    return 0;
}

const AnalyticsCharts: React.FC = () => {
    const { data: analytics, isLoading, error } = useQuery<ServiceAnalytics[]>('analytics', fetchAnalytics);

    if (isLoading) return <div>Loading analytics...</div>;
    if (error) return <div>An error occurred while fetching analytics.</div>;

    const chartData = analytics?.map(item => ({
        name: item.service_name,
        'Total Users': item.total_users,
        'Completed': item.completed_users,
        'Skipped': item.skipped_users,
        'Avg Wait (min)': durationToMinutes(item.average_wait_time).toFixed(2),
    }));

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Service Analytics (Today)</h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                    <h3 className="mb-4 font-semibold text-center">User Volume</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Total Users" fill="#8884d8" />
                            <Bar dataKey="Completed" fill="#82ca9d" />
                            <Bar dataKey="Skipped" fill="#ffc658" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="mb-4 font-semibold text-center">Average Wait Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Avg Wait (min)" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
