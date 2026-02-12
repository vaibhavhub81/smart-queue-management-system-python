import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { QueueEntry, Service } from '../../types';
import useWebSocket from '../../hooks/useWebSocket';

// API functions
const fetchMyServices = async (): Promise<Service[]> => {
    // Fetch services assigned to the current staff user
    const { data } = await api.get('/staff/my-services/');
    return data;
};

const fetchQueueForService = async (serviceId: number): Promise<QueueEntry[]> => {
    if (!serviceId) return [];
    // Fetches the initial state of the queue
    const { data } = await api.get(`/queue/status/${serviceId}/`);
    return data;
};

const callNextUser = async (serviceId: number) => {
    const { data } = await api.post(`/queue/manage/${serviceId}/call_next/`, { counter_id: 1 }); // Assuming counter 1
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
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    
    // Fetch services assigned to this staff member
    const { data: services, isLoading: servicesLoading } = useQuery<Service[]>('myServices', fetchMyServices);
    
    // Fetch initial queue state when a service is selected
    const { isLoading: initialQueueLoading } = useQuery<QueueEntry[]>(
        ['queue', selectedService], 
        () => fetchQueueForService(selectedService!),
        { 
            enabled: !!selectedService,
            onSuccess: (data) => {
                setQueue(data); // Set initial queue state
            }
        }
    );
    
    const lastJsonMessage = useWebSocket();

    // Listen for real-time updates from the WebSocket
    useEffect(() => {
        if (lastJsonMessage?.type === 'send_staff_notification') {
            const message = lastJsonMessage.message;
            if (message.type === 'queue_update' && message.service_id === selectedService) {
                setQueue(message.queue); // Update queue from WebSocket message
            }
        }
    }, [lastJsonMessage, selectedService]);


    const callNextMutation = useMutation(() => callNextUser(selectedService!));
    const completeMutation = useMutation(completeService);
    const skipMutation = useMutation(skipUser);

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
                            disabled={callNextMutation.isLoading || initialQueueLoading || queue.length === 0 || queue.every(u => u.status === 'in_progress')}
                        >
                            Call Next
                        </button>
                    </div>

                    {initialQueueLoading && <p>Loading queue...</p>}

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
