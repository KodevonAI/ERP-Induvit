import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useFacturas(params = {}) {
  return useQuery({
    queryKey: ['facturas', params],
    queryFn: () => api.get('/facturas', { params }).then((r) => r.data.data),
  });
}

export function useFactura(id) {
  return useQuery({
    queryKey: ['factura', id],
    queryFn: () => api.get(`/facturas/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/facturas', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facturas'] }),
  });
}

export function useUpdateFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/facturas/${id}`, data).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      qc.invalidateQueries({ queryKey: ['factura', id] });
    },
  });
}
