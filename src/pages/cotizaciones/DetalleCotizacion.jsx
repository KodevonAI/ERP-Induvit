import { useParams, useNavigate } from 'react-router-dom';
import { useCotizacion, useUpdateCotizacion } from '../../hooks/useCotizaciones';
import { useClientes } from '../../hooks/useClientes';
import { useProductos } from '../../hooks/useProductos';
import { useCreateFactura } from '../../hooks/useFacturas';
import { formatCurrency, calcTotales, calcItemSubtotal, calcItemIva, formatDate } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Receipt, CheckCircle, XCircle, Send } from 'lucide-react';

export default function DetalleCotizacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: cot, isLoading } = useCotizacion(id);
  const { data: clientes = [] } = useClientes();
  const { data: productos = [] } = useProductos();
  const updateCotizacion = useUpdateCotizacion();
  const createFactura = useCreateFactura();

  if (isLoading) return <div className="p-8 text-gray-400">Cargando...</div>;
  if (!cot) return <div className="p-8 text-gray-400">Cotización no encontrada.</div>;

  const cliente = clientes.find(c => c.id === cot.clienteId);
  const totales = calcTotales(cot.items ?? [], cot.descuento || 0);

  function cambiarEstado(nuevoEstado) {
    updateCotizacion.mutate({ id: cot.id, estado: nuevoEstado });
  }

  async function generarFactura() {
    const hoy = new Date().toISOString().split('T')[0];
    const venc = new Date(); venc.setDate(venc.getDate() + 30);
    try {
      const factura = await createFactura.mutateAsync({
        clienteId: cot.clienteId,
        cotizacionId: cot.id,
        vendedor: cot.vendedor,
        fecha: hoy,
        fechaVencimiento: venc.toISOString().split('T')[0],
        condicionesPago: cot.condicionesPago,
        observaciones: cot.observaciones,
        items: (cot.items ?? []).map(({ id: _id, cotizacionId: _cId, ...rest }) => rest),
      });
      updateCotizacion.mutate({ id: cot.id, estado: 'aprobada' });
      navigate(`/facturas/${factura.id}`);
    } catch (err) {
      console.error('Error al generar factura:', err);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Cotización ${cot.id}`}
        subtitle={`${cliente?.razonSocial} · ${formatDate(cot.fecha)}`}
      />

      <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/cotizaciones')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Volver a cotizaciones
          </button>

          <div className="flex items-center gap-3">
            <Badge status={cot.estado} />

            {cot.estado === 'borrador' && (
              <button
                onClick={() => cambiarEstado('enviada')}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
              >
                <Send size={15} /> Enviar al cliente
              </button>
            )}

            {cot.estado === 'enviada' && (
              <>
                <button
                  onClick={() => cambiarEstado('rechazada')}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50"
                >
                  <XCircle size={15} /> Rechazar
                </button>
                <button
                  onClick={generarFactura}
                  disabled={createFactura.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle size={15} /> {createFactura.isPending ? 'Generando...' : 'Aprobar y facturar'}
                </button>
              </>
            )}

            {cot.estado === 'aprobada' && cot.facturas && cot.facturas.length > 0 && (
              <button
                onClick={() => navigate(`/facturas/${cot.facturas[0].id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
              >
                <Receipt size={15} /> Ver factura
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Datos cotización */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">

            {/* Info general */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Información de la cotización</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <InfoRow label="N° Cotización" value={cot.id} />
                <InfoRow label="Fecha" value={formatDate(cot.fecha)} />
                <InfoRow label="Vigencia" value={formatDate(cot.vigencia)} />
                <InfoRow label="Vendedor" value={cot.vendedor} />
                <InfoRow label="Condiciones de pago" value={cot.condicionesPago} />
                <InfoRow label="Plazo de entrega" value={cot.plazoEntrega} />
              </div>
              {cot.observaciones && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                  <strong>Observaciones:</strong> {cot.observaciones}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-700">Ítems</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Descripción</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Dimensiones</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Cant.</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Precio/m²</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Precio Total</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">IVA</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cot.items ?? []).map(item => {
                      const sub = calcItemSubtotal(item);
                      const iva = calcItemIva(item);
                      const prod = productos.find(p => p.id === item.productoId);
                      return (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-700">{item.descripcion}</p>
                            <p className="text-xs text-gray-400">{prod?.codigo} · {item.unidad}</p>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500">
                            {item.ancho && item.alto
                              ? `${item.ancho}m × ${item.alto}m = ${item.area}m²`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.precioUnitario)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(sub)}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{item.iva}%</td>
                          <td className="px-5 py-3 text-right font-semibold text-gray-700">
                            {formatCurrency(sub + iva)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end p-6 border-t border-gray-50">
                <TotalesPanel totales={totales} />
              </div>
            </div>
          </div>

          {/* Sidebar cliente */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Cliente</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">{cliente?.razonSocial}</p>
                <p className="text-gray-400">NIT: {cliente?.nit}</p>
                <p className="text-gray-400">{cliente?.direccion}</p>
                <p className="text-gray-400">{cliente?.ciudad}, {cliente?.departamento}</p>
                <p className="text-gray-400">{cliente?.telefono}</p>
                <p className="text-gray-400">{cliente?.email}</p>
                <p className="text-xs text-gray-300 mt-2">{cliente?.regimen}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Resumen</h3>
              <TotalesPanel totales={totales} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}

function TotalesPanel({ totales, compact }) {
  return (
    <div className={`space-y-2 ${compact ? 'w-full' : 'w-72'}`}>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span>{formatCurrency(totales.subtotal)}</span>
      </div>
      {totales.totalDescuento > 0 && (
        <div className="flex justify-between text-sm text-red-500">
          <span>Descuento</span>
          <span>-{formatCurrency(totales.totalDescuento)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-gray-500">
        <span>IVA</span>
        <span>{formatCurrency(totales.totalIva)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-100">
        <span>Total</span>
        <span>{formatCurrency(totales.total)}</span>
      </div>
    </div>
  );
}
