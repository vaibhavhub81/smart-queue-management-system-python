import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import api from '../../services/api';
import { QueueEntry } from '../../types';
import useWebSocket from '../../hooks/useWebSocket';

const fetchMyQueues = async (): Promise<QueueEntry[]> => {
  const { data } = await api.get('/queue/my-queues/');
  return data;
};

const MyQueueStatus: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: myQueues, isLoading, error } = useQuery<QueueEntry[]>('my-queues', fetchMyQueues, {
    // Keep the data fresh but rely on websockets for instant updates
    refetchInterval: 30000, 
  });
  
  const [callMessage, setCallMessage] = useState<string | null>(null);
  const [customNotification, setCustomNotification] = useState<string | null>(null);
  const lastJsonMessage = useWebSocket();

  useEffect(() => {
    if (lastJsonMessage?.type === 'send_notification') {
        const message = lastJsonMessage.message;
        
        // Handle queue updates (status changes)
        if (message?.type === 'queue_update') {
            queryClient.invalidateQueries('my-queues');

            // If this message is calling the user, display it prominently
            if(message.status === 'in_progress') {
                setCallMessage(message.message);
                setCustomNotification(null); // Clear custom notification if being called
            } else {
                // Clear the call message if status is waiting, completed, etc.
                setCallMessage(null);
            }
        } 
        // Handle custom notifications
        else if (message?.type === 'custom_notification') {
            setCustomNotification(message.message);
            setCallMessage(null); // Clear call message if custom notification comes in
        }
    }
  }, [lastJsonMessage, queryClient]);

  if (isLoading) return <div>Loading your queue status...</div>;
  if (error) return <div>An error occurred.</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">My Queues</h2>
      
      {/* Display custom notification */}
      {customNotification && (
        <div className="p-4 mb-4 text-lg font-bold text-center text-white bg-purple-500 rounded-lg animate-pulse">
            {customNotification}
        </div>
      )}

      {/* Display call to action if user is being called */}
      {callMessage && (
        <div className="p-4 mb-4 text-lg font-bold text-center text-white bg-blue-500 rounded-lg animate-pulse">
            {callMessage}
        </div>
      )}

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
                    entry.status === 'completed' ? 'bg-green-500' : 
                    entry.status === 'rejected' ? 'bg-orange-500' : 'bg-red-500' // Added rejected status
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
    </div>
  );
};

export default MyQueueStatus;
