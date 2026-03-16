import { usePedidos, useUpdateEtapa } from '../../hooks/usePedidos';
import { useClientes } from '../../hooks/useClientes';
import { useProductos } from '../../hooks/useProductos';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import { CheckCircle2, Clock, Circle, Scissors, Flame, Truck, Package2, ArrowRight } from 'lucide-react';

export const ETAPAS = [
  { key: 'corte',    label: 'Corte',    icon: Scissors, color: 'blue'    },
  { key: 'templado', label: 'Templado', icon: Flame,    color: 'amber'   },
  { key: 'despacho', label: 'Despacho', icon: Truck,    color: 'emerald' },
];

export function emptyEtapas() {
  return {
    corte:    { completado: false, fechaFin: null },
    templado: { completado: false, fechaFin: null },
    despacho: { completado: false, fechaFin: null },
  };
}

export function getEtapaActualIdx(etapas) {
  for (let i = 0; i < ETAPAS.length; i++) {
    if (!etapas?.[ETAPAS[i].key]?.completado) return i;
  }
  return ETAPAS.length;
}

export function derivarEstadoItem(etapas) {
  if (!etapas) return 'pendiente';
  const completadas = ETAPAS.filter(e => etapas[e.key]?.completado).length;
  if (completadas === 0) return 'pendiente';
  if (completadas === ETAPAS.length) return 'completado';
  return 'en_proceso';
}

const colorMap = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500',    btn: 'bg-blue-600 hover:bg-blue-700'    },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500',   btn: 'bg-amber-600 hover:bg-amber-700'   },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700' },
};

export default function Produccion() {
  const { data: pedidos = [], isLoading } = usePedidos();
  const { data: clientes = [] } = useClientes();
  const { data: productos = [] } = useProductos();
  const navigate = useNavigate();
  const updateEtapa = useUpdateEtapa();

  const pedidosActivos = pedidos.filter(p => p.estado !== 'completado');

  // Contadores por etapa
  const counters = { corte: 0, templado: 0, despacho: 0, completado: 0, total: 0 };
  pedidosActivos.forEach(p => {
    p.items.forEach(item => {
      const idx = getEtapaActualIdx(item.etapas);
      counters.total++;
      if (idx === ETAPAS.length) counters.completado++;
      else counters[ETAPAS[idx].key]++;
    });
  });

  function completarEtapa(pedidoId, itemId, etapaKey) {
    updateEtapa.mutate({ pedidoId, itemId, etapa: etapaKey });
  }

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando producción...</div>;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Producción" subtitle="Seguimiento de fabricación del vidrio" />

      <div className="flex-1 p-4 md:p-8 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {ETAPAS.map(etapa => {
            const c = colorMap[etapa.color];
            const EtapaIcon = etapa.icon;
            return (
              <div key={etapa.key} className={`bg-white rounded-xl border ${c.border} p-4 md:p-5 flex items-center gap-3`}>
                <div className={`p-2.5 rounded-xl ${c.bg} shrink-0`}>
                  <EtapaIcon size={18} className={c.text} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">En {etapa.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{counters[etapa.key]}</p>
                  <p className="text-xs text-gray-400">ítems</p>
                </div>
              </div>
            );
          })}
          <div className="bg-white rounded-xl border border-emerald-100 p-4 md:p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 shrink-0">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Completados</p>
              <p className="text-2xl font-bold text-gray-800">{counters.completado}</p>
              <p className="text-xs text-gray-400">de {counters.total} totales</p>
            </div>
          </div>
        </div>

        {/* Barra de progreso global */}
        {counters.total > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Progreso global de fabricación</p>
              <p className="text-sm font-bold text-emerald-600">
                {Math.round((counters.completado / counters.total) * 100)}% completado
              </p>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {ETAPAS.map(etapa => {
                const pct = (counters[etapa.key] / counters.total) * 100;
                const c = colorMap[etapa.color];
                return pct > 0 ? (
                  <div key={etapa.key} className={`${c.dot} transition-all`} style={{ width: `${pct}%` }} title={`${etapa.label}: ${counters[etapa.key]}`} />
                ) : null;
              })}
              {counters.completado > 0 && (
                <div className="bg-emerald-500 transition-all" style={{ width: `${(counters.completado / counters.total) * 100}%` }} title={`Completados: ${counters.completado}`} />
              )}
              <div className="flex-1 bg-gray-100" />
            </div>
            <div className="flex items-center gap-4 mt-2.5 flex-wrap">
              {ETAPAS.map(etapa => {
                const c = colorMap[etapa.color];
                return (
                  <span key={etapa.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                    {etapa.label}: {counters[etapa.key]}
                  </span>
                );
              })}
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completado: {counters.completado}
              </span>
            </div>
          </div>
        )}

        {/* Tablero por pedido */}
        {pedidosActivos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package2 size={44} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No hay pedidos activos en producción</p>
          </div>
        ) : (
          pedidosActivos.map(pedido => {
            const cliente = clientes.find(c => c.id === pedido.clienteId);
            const completadosCount = pedido.items.filter(it => derivarEstadoItem(it.etapas) === 'completado').length;
            return (
              <div key={pedido.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Cabecera pedido */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-50 bg-gray-50/40">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-700">{pedido.id}</h3>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">en proceso</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cliente?.razonSocial} · Responsable: {pedido.responsable} · Entrega: {formatDate(pedido.fechaEntregaEstimada)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{completadosCount}/{pedido.items.length} ítems completados</span>
                    <button
                      onClick={() => navigate(`/pedidos/${pedido.id}`)}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Ver detalle <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Ítems */}
                <div className="divide-y divide-gray-50">
                  {pedido.items.map(item => {
                    const etapas = item.etapas || emptyEtapas();
                    const etapaActualIdx = getEtapaActualIdx(etapas);
                    const prod = productos.find(p => p.id === item.productoId);
                    const done = etapaActualIdx === ETAPAS.length;

                    return (
                      <div key={item.id} className={`px-4 md:px-6 py-4 ${done ? 'bg-emerald-50/30' : ''}`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Info ítem */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-700 truncate">{item.descripcion}</p>
                              {done && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {prod?.codigo} · {item.cantidad} {item.unidad}
                              {item.ancho && item.alto ? ` · ${item.ancho}m × ${item.alto}m = ${item.area}m²` : ''}
                            </p>
                          </div>

                          {/* Stepper de etapas */}
                          <div className="flex items-center gap-0 shrink-0">
                            {ETAPAS.map((etapa, i) => {
                              const EtapaIcon = etapa.icon;
                              const c = colorMap[etapa.color];
                              const isCompleted = etapas[etapa.key]?.completado;
                              const isCurrent = !isCompleted && i === etapaActualIdx;
                              const isLocked = !isCompleted && i > etapaActualIdx;

                              return (
                                <div key={etapa.key} className="flex items-center">
                                  {/* Conector */}
                                  {i > 0 && (
                                    <div className={`w-8 h-px mx-1 ${isCompleted || i < etapaActualIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                  )}

                                  {/* Etapa */}
                                  <div className="flex flex-col items-center gap-1" style={{ minWidth: '82px' }}>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                      isCompleted ? `${c.bg} ${c.border} ${c.text}` :
                                      isCurrent   ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm shadow-blue-100' :
                                      'bg-gray-50 border-gray-200 text-gray-400'
                                    }`}>
                                      {isCompleted
                                        ? <CheckCircle2 size={12} />
                                        : isCurrent
                                          ? <Clock size={12} className="animate-pulse" />
                                          : <Circle size={12} />
                                      }
                                      <EtapaIcon size={11} />
                                      {etapa.label}
                                    </div>

                                    {/* Fecha completado o botón */}
                                    {isCompleted && etapas[etapa.key]?.fechaFin ? (
                                      <span className="text-[10px] text-gray-400">{formatDate(etapas[etapa.key].fechaFin)}</span>
                                    ) : isCurrent ? (
                                      <button
                                        onClick={() => completarEtapa(pedido.id, item.id, etapa.key)}
                                        disabled={updateEtapa.isPending}
                                        className={`text-[10px] px-2.5 py-0.5 rounded text-white font-medium ${c.btn} transition-colors disabled:opacity-50`}
                                      >
                                        Completar
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-gray-300">{isLocked ? 'Pendiente' : ''}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
