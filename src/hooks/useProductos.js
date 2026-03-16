import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useProductos(params = {}) {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: () => api.get('/productos', { params }).then((r) => r.data.data),
  });
}

export function useCreateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/productos', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useUpdateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/productos/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useDeleteProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/productos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useToggleActivoProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/productos/${id}/activo`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}
