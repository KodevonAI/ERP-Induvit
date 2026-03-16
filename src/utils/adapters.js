/**
 * Transforma respuestas del backend al formato que espera la UI.
 * El backend devuelve pedidoItem.etapas como array [{etapa, completado, fechaFin}],
 * pero la UI espera un objeto {corte:{...}, templado:{...}, despacho:{...}}.
 */

export function adaptPedidoItem(item) {
  const etapasArr = item.etapas ?? [];
  const etapas = {};
  ['corte', 'templado', 'despacho'].forEach((e) => {
    const found = etapasArr.find((x) => x.etapa === e);
    etapas[e] = {
      completado: found?.completado ?? false,
      fechaFin: found?.fechaFin ?? null,
    };
  });
  return { ...item, etapas };
}

export function adaptPedido(pedido) {
  return {
    ...pedido,
    items: (pedido.items ?? []).map(adaptPedidoItem),
  };
}
