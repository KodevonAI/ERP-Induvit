import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { adaptPedido } from '../utils/adapters';

export function usePedidos(params = {}) {
  return useQuery({
    queryKey: ['pedidos', params],
    queryFn: () =>
      api.get('/pedidos', { params }).then((r) => (r.data.data ?? []).map(adaptPedido)),
  });
}

export function usePedido(id) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => api.get(`/pedidos/${id}`).then((r) => adaptPedido(r.data.data)),
    enabled: !!id,
  });
}

export function useCreatePedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/pedidos', data).then((r) => adaptPedido(r.data.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });
}

export function useUpdatePedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/pedidos/${id}`, data).then((r) => adaptPedido(r.data.data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      qc.invalidateQueries({ queryKey: ['pedido', id] });
    },
  });
}

export function useUpdateEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pedidoId, itemId, etapa }) =>
      api
        .patch(`/pedidos/${pedidoId}/items/${itemId}/etapa/${etapa}`)
        .then((r) => r.data.data),
    onSuccess: (_, { pedidoId }) => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      qc.invalidateQueries({ queryKey: ['pedido', pedidoId] });
    },
  });
}
