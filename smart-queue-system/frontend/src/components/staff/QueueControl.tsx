import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { QueueEntry, Service } from '../../types';
import useWebSocket from '../../hooks/useWebSocket';

const fetchServices = async (): Promise<Service[]> => {
    const { data } = await api.get('/services/services/');
    return data;
};

const fetchQueueForService = async (serviceId: number): Promise<QueueEntry[]> => {
    if (!serviceId) return [];
    const { data } = await api.get(`/queue/status/${serviceId}/`);
    return data;
};

const callNextUser = async (serviceId: number) => {
    const { data } = await api.post(`/queue/manage/${serviceId}/call_next/`, { counter_id: 1 }); // Assuming counter 1 for now
    return data;
};

const completeService = async (entryId: number) => {
    await api.post(`/queue/manage/${entryId}/complete_service/`);
};

const skipUser = async (entryId: number) => {
    await api.post(`/queue/manage/${entryId}/skip_user/`);
};


const QueueControl: React.FC = () => {
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const { data: services, isLoading: servicesLoading } = useQuery<Service[]>('services', fetchServices);
    const { data: queue, isLoading: queueLoading } = useQuery<QueueEntry[]>(
        ['queue', selectedService], 
        () => fetchQueueForService(selectedService!),
        { enabled: !!selectedService }
    );
    
    const lastJsonMessage = useWebSocket();

    useEffect(() => {
        if(lastJsonMessage && lastJsonMessage.message?.type === 'public_update'){
            queryClient.invalidateQueries('queue');
        }
    }, [lastJsonMessage, queryClient]);


    const callNextMutation = useMutation(() => callNextUser(selectedService!), {
        onSuccess: () => queryClient.invalidateQueries('queue')
    });

    const completeMutation = useMutation(completeService, {
        onSuccess: () => queryClient.invalidateQueries('queue')
    });

    const skipMutation = useMutation(skipUser, {
        onSuccess: () => queryClient.invalidateQueries('queue')
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Queue Control</h2>

            {/* Service Selector */}
            <div className="mb-6">
                <label htmlFor="service-select" className="block text-sm font-medium text-gray-700">Select a Service</label>
                <select
                    id="service-select"
                    className="w-full max-w-xs mt-1 border-gray-300 rounded-md"
                    onChange={(e) => setSelectedService(Number(e.target.value))}
                    value={selectedService || ''}
                    disabled={servicesLoading}
                >
                    <option value="" disabled>-- Select Service --</option>
                    {services?.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                </select>
            </div>

            {selectedService && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Current Queue</h3>
                        <button
                            onClick={() => callNextMutation.mutate()}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            disabled={callNextMutation.isLoading || queueLoading || !queue || queue.length === 0}
                        >
                            Call Next
                        </button>
                    </div>

                    {queueLoading && <p>Loading queue...</p>}

                    {queue && queue.length > 0 ? (
                        <ul className="space-y-2">
                            {queue.map(entry => (
                                <li key={entry.id} className={`p-3 rounded-lg flex justify-between items-center ${entry.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-50'}`}>
                                    <div>
                                        <p className="font-bold">Token: {entry.token_number}</p>
                                        <p className="text-sm text-gray-600">User: {entry.user.username}</p>
                                    </div>
                                    {entry.status === 'in_progress' && (
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => completeMutation.mutate(entry.id)}
                                                className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                            >
                                                Complete
                                            </button>
                                            <button 
                                                onClick={() => skipMutation.mutate(entry.id)}
                                                className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                                            >
                                                Skip
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>The queue is empty.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QueueControl;
