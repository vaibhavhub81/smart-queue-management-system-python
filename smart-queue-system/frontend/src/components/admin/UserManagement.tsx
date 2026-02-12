import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { User } from '../../types';

// API functions for User Management
const fetchUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/admin/users/');
    return data;
};

const createUser = async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.post('/admin/users/', userData);
    return data;
};

const updateUser = async ({ id, ...userData }: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/admin/users/${id}/`, userData);
    return data;
};

const deleteUser = async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}/`);
};

const UserManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);

    const { data: users, isLoading } = useQuery<User[]>('users', fetchUsers);

    const createMutation = useMutation(createUser, {
        onSuccess: () => {
            queryClient.invalidateQueries('users');
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation(updateUser, {
        onSuccess: () => {
            queryClient.invalidateQueries('users');
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation(deleteUser, {
        onSuccess: () => {
            queryClient.invalidateQueries('users');
        },
    });

    const handleOpenModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userData: Partial<User> = {
            username: formData.get('username') as string,
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as User['role'],
        };
        if (formData.get('password')) {
            userData.password = formData.get('password') as string;
        }

        if (currentUser?.id) {
            updateMutation.mutate({ ...userData, id: currentUser.id });
        } else {
            createMutation.mutate(userData);
        }
    };
    
    if (isLoading) return <div>Loading users...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Add User
                </button>
            </div>
            
            {/* User Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">Username</th>
                            <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">Full Name</th>
                            <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">Role</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{user.username}</td>
                                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{`${user.first_name} ${user.last_name}`}</td>
                                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{user.role}</td>
                                <td className="px-6 py-4 text-sm font-medium leading-5 text-right whitespace-no-wrap border-b border-gray-200">
                                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => deleteMutation.mutate(user.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit User */}
            {isModalOpen && (
                 <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">{currentUser?.id ? 'Edit User' : 'Add New User'}</h3>
                            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                    <input type="text" name="username" id="username" defaultValue={currentUser?.username || ''} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" name="first_name" id="first_name" defaultValue={currentUser?.first_name || ''} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" name="last_name" id="last_name" defaultValue={currentUser?.last_name || ''} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" id="email" defaultValue={currentUser?.email || ''} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password ({currentUser?.id ? 'Leave blank to keep unchanged' : 'Required'})</label>
                                    <input type="password" name="password" id="password" required={!currentUser?.id} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                    <select name="role" id="role" defaultValue={currentUser?.role || 'student'} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
                                        <option value="student">Student</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
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

export default UserManagement;
