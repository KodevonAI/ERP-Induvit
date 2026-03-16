import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePedido, useUpdatePedido, useUpdateEtapa } from '../../hooks/usePedidos';
import { useClientes } from '../../hooks/useClientes';
import { useProductos } from '../../hooks/useProductos';
import { formatDate } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Receipt, CheckCircle2, Circle, Clock, Play, Save, Printer } from 'lucide-react';
import { ETAPAS, emptyEtapas, getEtapaActualIdx, derivarEstadoItem } from '../produccion/Produccion';

export default function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: pedido, isLoading } = usePedido(id);
  const { data: clientes = [] } = useClientes();
  const { data: productos = [] } = useProductos();
  const updatePedido = useUpdatePedido();
  const updateEtapa = useUpdateEtapa();

  const [notas, setNotas] = useState('');
  const [itemNotas, setItemNotas] = useState({});
  const [notasLoaded, setNotasLoaded] = useState(false);

  if (isLoading) return <div className="p-8 text-gray-400">Cargando...</div>;
  if (!pedido) return <div className="p-8 text-gray-400">Pedido no encontrado.</div>;

  if (!notasLoaded) {
    setNotas(pedido.observacionesProduccion || '');
    setItemNotas(Object.fromEntries((pedido.items ?? []).map(it => [it.id, it.notasTecnicas || ''])));
    setNotasLoaded(true);
  }

  const cliente = clientes.find(c => c.id === pedido.clienteId);

  function cambiarEstado(nuevoEstado) {
    updatePedido.mutate({ id: pedido.id, estado: nuevoEstado, observacionesProduccion: notas });
  }

  function completarEtapa(itemId, etapaKey) {
    updateEtapa.mutate({ pedidoId: pedido.id, itemId, etapa: etapaKey });
  }

  function guardarNotas() {
    updatePedido.mutate({
      id: pedido.id,
      observacionesProduccion: notas,
      items: (pedido.items ?? []).map(it => ({
        id: it.id,
        notasTecnicas: itemNotas[it.id] ?? it.notasTecnicas,
      })),
    });
  }

  const colorMap = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    btn: 'bg-blue-600 hover:bg-blue-700'    },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   btn: 'bg-amber-600 hover:bg-amber-700'   },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  };

  const itemStateWrapper = {
    pendiente:  'border-gray-200 bg-white',
    en_proceso: 'border-blue-200 bg-blue-50/20',
    completado: 'border-emerald-200 bg-emerald-50/20',
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Pedido ${pedido.id}`}
        subtitle={`${cliente?.razonSocial} · Fabricación`}
      />

      <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/pedidos')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Volver a pedidos
          </button>
          <div className="flex items-center gap-3">
            <Badge status={pedido.estado} />
            {pedido.estado === 'pendiente' && (
              <button
                onClick={() => cambiarEstado('en_proceso')}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
              >
                <Play size={15} /> Iniciar producción
              </button>
            )}
            {pedido.estado === 'en_proceso' && (
              <button
                onClick={() => navigate('/produccion')}
                className="flex items-center gap-2 px-4 py-2 border border-brand-200 text-brand-600 text-sm rounded-lg hover:bg-brand-50"
              >
                Ver tablero producción
              </button>
            )}
            <button
              onClick={() => navigate(`/pedidos/${pedido.id}/orden`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
            >
              <Printer size={15} /> Orden de producción
            </button>
            {pedido.facturaId && (
              <button
                onClick={() => navigate(`/facturas/${pedido.facturaId}`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                <Receipt size={15} /> Ver factura
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">

            {/* Info general */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Información del pedido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <InfoRow label="N° Pedido" value={pedido.id} />
                <InfoRow label="Factura origen" value={pedido.facturaId} />
                <InfoRow label="Fecha de creación" value={formatDate(pedido.fecha)} />
                <InfoRow label="Entrega estimada" value={formatDate(pedido.fechaEntregaEstimada)} />
                <InfoRow label="Responsable" value={pedido.responsable} />
                <InfoRow label="Estado" value={<Badge status={pedido.estado} />} />
              </div>
            </div>

            {/* Items con etapas */}
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-700">Ítems de fabricación</h3>
                <p className="text-xs text-gray-400 mt-0.5">Marque cada etapa al completarla: Corte → Templado → Despacho</p>
              </div>
              <div className="p-4 space-y-3">
                {(pedido.items ?? []).map(item => {
                  const etapas = item.etapas || emptyEtapas();
                  const etapaActualIdx = getEtapaActualIdx(etapas);
                  const estadoItem = derivarEstadoItem(etapas);
                  const prod = productos.find(p => p.id === item.productoId);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition-colors ${itemStateWrapper[estadoItem] || itemStateWrapper.pendiente}`}
                    >
                      {/* Header ítem */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-700">{item.descripcion}</p>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{prod?.codigo}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span><strong>Cantidad:</strong> {item.cantidad} {item.unidad}</span>
                            {item.ancho && item.alto && (
                              <span><strong>Dims:</strong> {item.ancho}m × {item.alto}m ({item.area}m²)</span>
                            )}
                          </div>
                        </div>
                        <Badge status={estadoItem} />
                      </div>

                      {/* Stepper de etapas */}
                      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                        {ETAPAS.map((etapa, i) => {
                          const EtapaIcon = etapa.icon;
                          const c = colorMap[etapa.color];
                          const isCompleted = etapas[etapa.key]?.completado;
                          const isCurrent = !isCompleted && i === etapaActualIdx;
                          const isLocked = !isCompleted && i > etapaActualIdx;

                          return (
                            <div key={etapa.key} className="flex items-center shrink-0">
                              {i > 0 && (
                                <div className={`w-8 h-px mx-1 ${isCompleted || i <= etapaActualIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                              )}
                              <div className="flex flex-col items-center gap-1.5">
                                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                  isCompleted ? `${c.bg} ${c.border} ${c.text}` :
                                  isCurrent   ? 'bg-white border-blue-300 text-blue-700 shadow-sm' :
                                  'bg-white border-gray-200 text-gray-400'
                                }`}>
                                  {isCompleted
                                    ? <CheckCircle2 size={13} />
                                    : isCurrent
                                      ? <Clock size={13} className="animate-pulse" />
                                      : <Circle size={13} />
                                  }
                                  <EtapaIcon size={12} />
                                  <span>{etapa.label}</span>
                                </div>
                                {isCompleted && etapas[etapa.key]?.fechaFin ? (
                                  <span className="text-[10px] text-gray-400">{formatDate(etapas[etapa.key].fechaFin)}</span>
                                ) : isCurrent ? (
                                  <button
                                    onClick={() => completarEtapa(item.id, etapa.key)}
                                    disabled={updateEtapa.isPending}
                                    className={`text-[10px] px-2.5 py-1 rounded text-white font-medium ${c.btn} transition-colors disabled:opacity-50`}
                                  >
                                    ✓ Completar
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-300">{isLocked ? 'Bloqueado' : ''}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Notas técnicas */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Notas técnicas</label>
                        <textarea
                          rows={2}
                          value={itemNotas[item.id] ?? item.notasTecnicas ?? ''}
                          onChange={e => setItemNotas(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Instrucciones especiales, acabados, tolerancias..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Observaciones de producción</h3>
              <textarea
                rows={3}
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Notas internas del taller, instrucciones especiales de entrega..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <button
                onClick={guardarNotas}
                disabled={updatePedido.isPending}
                className="mt-3 flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save size={14} /> {updatePedido.isPending ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Cliente</h3>
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-gray-700">{cliente?.razonSocial}</p>
                <p className="text-gray-400">NIT: {cliente?.nit}</p>
                <p className="text-gray-400">{cliente?.ciudad}</p>
                <p className="text-gray-400">{cliente?.telefono}</p>
                <p className="text-gray-400">{cliente?.contacto}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Progreso de fabricación</h3>
              <div className="space-y-3">
                {(pedido.items ?? []).map(item => {
                  const etapas = item.etapas || emptyEtapas();
                  const etapaActualIdx = getEtapaActualIdx(etapas);
                  const completadas = ETAPAS.filter(e => etapas[e.key]?.completado).length;
                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-600 truncate flex-1 mr-2">{item.descripcion}</span>
                        <span className="text-xs text-gray-400 shrink-0">{completadas}/{ETAPAS.length}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {ETAPAS.map((etapa, i) => {
                          const c = colorMap[etapa.color];
                          const done = etapas[etapa.key]?.completado;
                          const isCurrent = !done && i === etapaActualIdx;
                          return (
                            <div
                              key={etapa.key}
                              className={`flex-1 h-2 rounded-sm transition-all ${
                                done ? c.bg.replace('bg-', 'bg-').replace('-50', '-400') :
                                isCurrent ? 'bg-blue-200' :
                                'bg-gray-100'
                              }`}
                              title={etapa.label}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Ítems completados</span>
                  <span>{(pedido.items ?? []).filter(it => derivarEstadoItem(it.etapas) === 'completado').length}/{(pedido.items ?? []).length}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${((pedido.items ?? []).filter(it => derivarEstadoItem(it.etapas) === 'completado').length / Math.max((pedido.items ?? []).length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Resumen etapas */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Etapas del proceso</h3>
              <div className="space-y-2.5">
                {ETAPAS.map((etapa, i) => {
                  const EtapaIcon = etapa.icon;
                  const c = colorMap[etapa.color];
                  const itemsEnEtapa = (pedido.items ?? []).filter(it => {
                    const e = it.etapas || emptyEtapas();
                    return !e[etapa.key]?.completado && getEtapaActualIdx(e) === i;
                  }).length;
                  const itemsDone = (pedido.items ?? []).filter(it => (it.etapas || emptyEtapas())[etapa.key]?.completado).length;
                  return (
                    <div key={etapa.key} className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${c.bg}`}>
                        <EtapaIcon size={13} className={c.text} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">{i + 1}. {etapa.label}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">{itemsDone}/{(pedido.items ?? []).length}</span>
                        {itemsEnEtapa > 0 && (
                          <span className={`ml-1.5 text-[10px] ${c.bg} ${c.text} px-1.5 py-0.5 rounded-full font-medium`}>activo</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
      <div className="font-medium text-gray-700 mt-0.5">{value || '-'}</div>
    </div>
  );
}
