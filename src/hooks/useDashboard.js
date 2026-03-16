import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
    staleTime: 60_000,
  });
}
