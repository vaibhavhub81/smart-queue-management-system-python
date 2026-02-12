import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { Service, User } from '../../types';

// API functions for Service Management
const fetchAdminServices = async (): Promise<Service[]> => {
    const { data } = await api.get('/admin/services/');
    return data;
};

const fetchAllUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/admin/users/');
    return data;
};

const createService = async (serviceData: Partial<Service>): Promise<Service> => {
    const { data } = await api.post('/admin/services/', serviceData);
    return data;
};

const updateService = async ({ id, ...serviceData }: Partial<Service>): Promise<Service> => {
    const { data } = await api.put(`/admin/services/${id}/`, serviceData);
    return data;
};

const deleteService = async (serviceId: number): Promise<void> => {
    await api.delete(`/admin/services/${serviceId}/`);
};


const ServiceManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);

    const { data: services, isLoading: servicesLoading } = useQuery<Service[]>('adminServices', fetchAdminServices);
    const { data: users, isLoading: usersLoading } = useQuery<User[]>('allUsers', fetchAllUsers);

    const staffUsers = users?.filter(user => user.role === 'staff' || user.role === 'admin');

    const createMutation = useMutation(createService, {
        onSuccess: () => {
            queryClient.invalidateQueries('adminServices');
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation(updateService, {
        onSuccess: () => {
            queryClient.invalidateQueries('adminServices');
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation(deleteService, {
        onSuccess: () => {
            queryClient.invalidateQueries('adminServices');
        },
    });

    const handleOpenModal = (service: Partial<Service> | null = null) => {
        setCurrentService(service);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const serviceData: Partial<Service> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            is_active: formData.get('is_active') === 'on',
            staff: Array.from(formData.getAll('staff')).map(id => Number(id)),
        };

        if (currentService?.id) {
            updateMutation.mutate({ ...serviceData, id: currentService.id });
        } else {
            createMutation.mutate(serviceData);
        }
    };
    
    if (servicesLoading || usersLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Service Management</h2>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Add Service
                </button>
            </div>
            
            {/* Service Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">Name</th>
                            <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">Status</th>
                            <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">Assigned Staff</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services?.map(service => (
                            <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{service.name}</td>
                                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                    {service.is_active ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span> : <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Inactive</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{service.staff?.length || 0}</td>
                                <td className="px-6 py-4 text-sm font-medium leading-5 text-right whitespace-no-wrap border-b border-gray-200">
                                    <button onClick={() => handleOpenModal(service)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => deleteMutation.mutate(service.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit Service */}
            {isModalOpen && (
                 <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">{currentService?.id ? 'Edit Service' : 'Add New Service'}</h3>
                            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Service Name</label>
                                    <input type="text" name="name" id="name" defaultValue={currentService?.name || ''} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea name="description" id="description" defaultValue={currentService?.description || ''} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="staff" className="block text-sm font-medium text-gray-700">Assign Staff</label>
                                    <select name="staff" id="staff" multiple defaultValue={currentService?.staff?.map(String) || []} className="w-full h-40 px-3 py-2 mt-1 border border-gray-300 rounded-md">
                                        {staffUsers?.map(user => (
                                            <option key={user.id} value={user.id}>{user.username} ({user.first_name} {user.last_name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" name="is_active" id="is_active" defaultChecked={currentService?.is_active ?? true} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                                    <label htmlFor="is_active" className="block ml-2 text-sm text-gray-900">Service is active</label>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
