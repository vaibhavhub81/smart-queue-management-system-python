import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { Service } from '../../types';

const fetchServices = async (): Promise<Service[]> => {
  const { data } = await api.get('/services/services/');
  return data;
};

const joinQueue = async (serviceId: number) => {
  const { data } = await api.post('/queue/join/', { service: serviceId });
  return data;
};

const ServiceList: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: services, isLoading, error } = useQuery<Service[]>('services', fetchServices);

  const mutation = useMutation(joinQueue, {
    onSuccess: () => {
      // Invalidate and refetch the my-queues query to update the status
      queryClient.invalidateQueries('my-queues');
    },
    onError: (error: any) => {
        alert(error.response?.data?.detail || "You are already in this queue.");
    }
  });

  if (isLoading) return <div>Loading services...</div>;
  if (error) return <div>An error occurred while fetching services.</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Available Services</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services?.map((service) => (
          <div key={service.id} className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
            <button
              onClick={() => mutation.mutate(service.id)}
              className="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? 'Joining...' : 'Join Queue'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;
