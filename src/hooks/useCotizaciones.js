import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useCotizaciones(params = {}) {
  return useQuery({
    queryKey: ['cotizaciones', params],
    queryFn: () => api.get('/cotizaciones', { params }).then((r) => r.data.data),
  });
}

export function useCotizacion(id) {
  return useQuery({
    queryKey: ['cotizacion', id],
    queryFn: () => api.get(`/cotizaciones/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/cotizaciones', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }),
  });
}

export function useUpdateCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/cotizaciones/${id}`, data).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      qc.invalidateQueries({ queryKey: ['cotizacion', id] });
    },
  });
}
