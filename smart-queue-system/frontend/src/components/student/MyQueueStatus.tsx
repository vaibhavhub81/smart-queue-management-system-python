import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { QueueEntry } from '../../types';
import useWebSocket from '../../hooks/useWebSocket';

const fetchMyQueues = async (): Promise<QueueEntry[]> => {
  const { data } = await api.get('/queue/my-queues/');
  return data;
};

const MyQueueStatus: React.FC = () => {
  const { data: myQueues, isLoading, error } = useQuery<QueueEntry[]>('my-queues', fetchMyQueues);
  const [notifications, setNotifications] = useState<any[]>([]);
  const lastJsonMessage = useWebSocket();

  useEffect(() => {
    if (lastJsonMessage) {
      setNotifications(prev => [...prev, lastJsonMessage]);
      // You can also add a browser notification here
    }
  }, [lastJsonMessage]);

  if (isLoading) return <div>Loading your queue status...</div>;
  if (error) return <div>An error occurred.</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">My Queues</h2>
      {myQueues && myQueues.length > 0 ? (
        <ul className="space-y-4">
          {myQueues.map((entry) => (
            <li key={entry.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{entry.service.name}</p>
                  <p className="text-sm text-gray-600">Token: <span className="font-bold">{entry.token_number}</span></p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
                    entry.status === 'waiting' ? 'bg-yellow-500' :
                    entry.status === 'in_progress' ? 'bg-blue-500' :
                    entry.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {entry.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>You are not in any queues.</p>
      )}
      
      <div className="mt-6">
        <h3 className="mb-2 text-lg font-bold">Notifications</h3>
        <div className="h-48 p-2 overflow-y-auto bg-gray-100 border rounded-md">
            {notifications.map((note, index) => (
                <div key={index} className="p-2 mb-2 text-sm bg-gray-200 rounded">
                    {typeof note.message === 'string' ? note.message : JSON.stringify(note.message)}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MyQueueStatus;
