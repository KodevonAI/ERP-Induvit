import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatCurrency, calcTotales, calcItemSubtotal, calcItemIva, formatDate } from '../../utils/formatters';
import { enviarFacturaDian } from '../../utils/dian';
import { nextId } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import {
  ArrowLeft, Send, CheckCircle, Loader2, AlertTriangle,
  ClipboardList, ExternalLink, ShieldCheck
} from 'lucide-react';

export default function DetalleFactura() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  const fac = state.facturas.find(f => f.id === id);
  const [enviando, setEnviando] = useState(false);
  const [dianStep, setDianStep] = useState('');
  const [error, setError] = useState('');

  if (!fac) return <div className="p-8 text-gray-400">Factura no encontrada.</div>;

  const cliente = state.clientes.find(c => c.id === fac.clienteId);
  const totales = calcTotales(fac.items);

  const steps = [
    'Conectando con servicio DIAN...',
    'Validando estructura XML UBL 2.1...',
    'Firmando documento con certificado digital...',
    'Enviando a habilitación DIAN...',
    'Esperando respuesta del servidor DIAN...',
    'Procesando acuse de recibo...',
  ];

  async function enviarDian() {
    setEnviando(true);
    setError('');

    for (const step of steps) {
      setDianStep(step);
      await new Promise(r => setTimeout(r, 700));
    }

    try {
      const resp = await enviarFacturaDian(fac);
      const updated = {
        ...fac,
        estadoDian: 'aceptada',
        cufe: resp.cufe,
        fechaAceptacionDian: resp.fechaAceptacion,
      };
      dispatch({ type: 'UPDATE_FACTURA', payload: updated });
    } catch (e) {
      setError(e.message);
      dispatch({ type: 'UPDATE_FACTURA', payload: { ...fac, estadoDian: 'error' } });
    } finally {
      setEnviando(false);
      setDianStep('');
    }
  }

  function generarPedido() {
    const pedId = nextId(state.pedidos, 'PF');
    const hoy = new Date();
    const entrega = new Date(); entrega.setDate(hoy.getDate() + 20);

    const pedido = {
      id: pedId,
      numero: pedId,
      fecha: hoy.toISOString().split('T')[0],
      fechaEntregaEstimada: entrega.toISOString().split('T')[0],
      facturaId: fac.id,
      clienteId: fac.clienteId,
      estado: 'pendiente',
      responsable: 'Javier Morales',
      observacionesProduccion: fac.observaciones || '',
      items: fac.items.map(it => ({
        ...it,
        estadoItem: 'pendiente',
        notasTecnicas: '',
      })),
    };
    dispatch({ type: 'ADD_PEDIDO', payload: pedido });
    dispatch({ type: 'UPDATE_FACTURA', payload: { ...fac, pedidoId: pedId } });
    navigate(`/pedidos/${pedId}`);
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Factura ${fac.id}`}
        subtitle={`${cliente?.razonSocial} · ${formatDate(fac.fecha)}`}
      />

      <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/facturas')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Volver a facturas
          </button>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Badge status={fac.estadoDian} />

            {fac.estadoDian === 'pendiente' && !enviando && (
              <button
                onClick={enviarDian}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
              >
                <Send size={15} /> Enviar a DIAN
              </button>
            )}

            {fac.estadoDian === 'aceptada' && !fac.pedidoId && (
              <button
                onClick={generarPedido}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
              >
                <ClipboardList size={15} /> Generar pedido de fabricación
              </button>
            )}

            {fac.pedidoId && (
              <button
                onClick={() => navigate(`/pedidos/${fac.pedidoId}`)}
                className="flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-700 text-sm rounded-lg hover:bg-emerald-50"
              >
                <ClipboardList size={15} /> Ver pedido {fac.pedidoId}
              </button>
            )}
          </div>
        </div>

        {/* DIAN progress */}
        {enviando && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="text-brand-600 animate-spin" />
              <div>
                <p className="font-medium text-brand-700">Procesando con DIAN</p>
                <p className="text-sm text-brand-500 mt-0.5">{dianStep}</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Error DIAN */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-700">Error al enviar a DIAN</p>
              <p className="text-sm text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* DIAN aceptada */}
        {fac.estadoDian === 'aceptada' && fac.cufe && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-emerald-700">Factura aceptada por la DIAN</p>
                <p className="text-xs text-emerald-600 mt-1 font-mono break-all">CUFE: {fac.cufe}</p>
              </div>
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ver en DIAN <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">

            {/* Info general */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Datos de la factura</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <InfoRow label="N° Factura" value={fac.numero} />
                <InfoRow label="Cotización origen" value={fac.cotizacionId} />
                <InfoRow label="Fecha de emisión" value={formatDate(fac.fecha)} />
                <InfoRow label="Fecha de vencimiento" value={formatDate(fac.fechaVencimiento)} />
                <InfoRow label="Vendedor" value={fac.vendedor} />
                <InfoRow label="Condiciones de pago" value={fac.condicionesPago} />
              </div>
              {fac.observaciones && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                  <strong>Observaciones:</strong> {fac.observaciones}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-700">Ítems facturados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Descripción</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Dimensiones</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Cant.</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Precio unit.</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Desc.</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">IVA</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fac.items.map(item => {
                      const sub = calcItemSubtotal(item);
                      const iva = calcItemIva(item);
                      const prod = state.productos.find(p => p.id === item.productoId);
                      return (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-700">{item.descripcion}</p>
                            <p className="text-xs text-gray-400">{prod?.codigo} · {item.unidad}</p>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500 text-xs">
                            {item.ancho && item.alto
                              ? `${item.ancho}m × ${item.alto}m`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.precioUnitario)}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{item.descuento > 0 ? `${item.descuento}%` : '-'}</td>
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

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Cliente</h3>
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-gray-700">{cliente?.razonSocial}</p>
                <p className="text-gray-400">NIT: {cliente?.nit}</p>
                <p className="text-gray-400">{cliente?.direccion}</p>
                <p className="text-gray-400">{cliente?.ciudad}, {cliente?.departamento}</p>
                <p className="text-gray-400">{cliente?.email}</p>
                <p className="text-xs mt-2 text-gray-300">{cliente?.regimen}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Totales</h3>
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
      <p className="font-medium text-gray-700 mt-0.5">{value || '-'}</p>
    </div>
  );
}

function TotalesPanel({ totales, compact }) {
  return (
    <div className={`space-y-2 ${compact ? 'w-full' : 'w-72'}`}>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span>{formatCurrency(totales.subtotal + totales.totalDescuento)}</span>
      </div>
      {totales.totalDescuento > 0 && (
        <div className="flex justify-between text-sm text-red-500">
          <span>Descuentos</span>
          <span>-{formatCurrency(totales.totalDescuento)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal neto</span>
        <span>{formatCurrency(totales.subtotal)}</span>
      </div>
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
