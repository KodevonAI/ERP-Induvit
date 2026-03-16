const variants = {
  // Cotizaciones
  borrador:   'bg-gray-100 text-gray-600',
  enviada:    'bg-blue-50 text-blue-700',
  aprobada:   'bg-emerald-50 text-emerald-700',
  rechazada:  'bg-red-50 text-red-600',
  // DIAN
  pendiente:  'bg-amber-50 text-amber-700',
  aceptada:   'bg-emerald-50 text-emerald-700',
  error:      'bg-red-50 text-red-600',
  // Producción
  en_proceso: 'bg-blue-50 text-blue-700',
  completado: 'bg-emerald-50 text-emerald-700',
  // Genéricos
  default:    'bg-gray-100 text-gray-600',
};

const labels = {
  borrador:   'Borrador',
  enviada:    'Enviada',
  aprobada:   'Aprobada',
  rechazada:  'Rechazada',
  pendiente:  'Pendiente',
  aceptada:   'Aceptada DIAN',
  error:      'Error DIAN',
  en_proceso: 'En Proceso',
  completado: 'Completado',
};

export default function Badge({ status, label, className = '' }) {
  const cls = variants[status] || variants.default;
  const text = label || labels[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {text}
    </span>
  );
}
