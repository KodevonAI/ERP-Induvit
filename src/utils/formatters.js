export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function calcItemSubtotal(item) {
  const area = item.area > 0 ? item.area : 1;
  return item.precioUnitario * area * item.cantidad;
}

export function calcItemIva(item) {
  return calcItemSubtotal(item) * (item.iva / 100);
}

export function calcItemTotal(item) {
  return calcItemSubtotal(item) + calcItemIva(item);
}

export function calcTotales(items, descuentoPct = 0) {
  const subtotal = items.reduce((s, i) => s + calcItemSubtotal(i), 0);
  const totalDescuento = subtotal * (descuentoPct / 100);
  const factor = 1 - descuentoPct / 100;
  const totalIva = items.reduce((s, i) => s + calcItemIva(i) * factor, 0);
  const total = subtotal - totalDescuento + totalIva;
  return { subtotal, totalDescuento, totalIva, total };
}

export function nextId(list, prefix) {
  const year = new Date().getFullYear();
  const nums = list
    .map(x => {
      const parts = x.id.split('-');
      return parseInt(parts[parts.length - 1]) || 0;
    })
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${year}-${String(next).padStart(3, '0')}`;
}
