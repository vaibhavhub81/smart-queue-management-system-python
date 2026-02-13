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

const rejectUser = async (entryId: number) => {
    await api.post(`/queue/manage/${entryId}/reject_user/`);
};

const sendCustomNotification = async ({ entryId, message }: { entryId: number; message: string }) => {
    await api.post(`/queue/manage/${entryId}/send_custom_notification/`, { message });
};


const QueueControl: React.FC = () => {
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [targetEntryId, setTargetEntryId] = useState<number | null>(null);
    const [defaultNotificationMessage, setDefaultNotificationMessage] = useState('');

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
    const rejectMutation = useMutation(rejectUser);
    const sendNotificationMutation = useMutation(sendCustomNotification, {
        onSuccess: () => {
            alert('Notification sent!');
            setIsNotificationModalOpen(false);
            setNotificationMessage('');
            setTargetEntryId(null);
        },
        onError: (error: any) => {
            alert(`Failed to send notification: ${error.message}`);
        }
    });

    const openNotificationModal = (entryId: number, defaultMessage: string = '') => {
        setTargetEntryId(entryId);
        setNotificationMessage(defaultMessage);
        setIsNotificationModalOpen(true);
    };

    const handleSendNotification = () => {
        if (targetEntryId && notificationMessage.trim()) {
            sendNotificationMutation.mutate({ entryId: targetEntryId, message: notificationMessage });
        } else {
            alert('Please enter a message.');
        }
    };

    const inProgressEntry = queue.find(entry => entry.status === 'in_progress');
    const waitingEntries = queue.filter(entry => entry.status === 'waiting');
    const nextInLineEntry = waitingEntries.length > 0 ? waitingEntries[0] : null;

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
                                <li key={entry.id} className={`p-3 rounded-lg flex justify-between items-center ${
                                    entry.status === 'in_progress' ? 'bg-blue-100' :
                                    entry.status === 'waiting' ? 'bg-gray-50' :
                                    'bg-gray-200' // For completed, skipped, rejected
                                }`}>
                                    <div>
                                        <p className="font-bold">Token: {entry.token_number} - {entry.user.username}</p>
                                        <p className="text-sm text-gray-600">Status: {entry.status}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {(entry.status === 'in_progress' || entry.status === 'waiting') && (
                                            <>
                                                {entry.status === 'in_progress' && (
                                                    <button 
                                                        onClick={() => completeMutation.mutate(entry.id)}
                                                        className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => skipMutation.mutate(entry.id)}
                                                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                                                >
                                                    Skip
                                                </button>
                                                <button 
                                                    onClick={() => rejectMutation.mutate(entry.id)}
                                                    className="px-3 py-1 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => openNotificationModal(entry.id)}
                                                    className="px-3 py-1 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
                                                >
                                                    Notify
                                                </button>
                                            </>
                                        )}
                                        {nextInLineEntry?.id === entry.id && (
                                            <button
                                                onClick={() => openNotificationModal(
                                                    entry.id, 
                                                    `Your service ${services?.find(s => s.id === selectedService)?.name || ''} is about to serve, consider leaving.`
                                                )}
                                                className="px-3 py-1 text-sm text-white bg-indigo-500 rounded hover:bg-indigo-600"
                                            >
                                                Pre-call Notify
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>The queue is empty.</p>
                    )}
                </div>
            )}

            {/* Custom Notification Modal */}
            {isNotificationModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Send Custom Notification</h3>
                            <div className="mt-4">
                                <textarea
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={4}
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    placeholder="Enter your message here..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => setIsNotificationModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendNotification}
                                    className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                    disabled={sendNotificationMutation.isLoading}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueueControl;
