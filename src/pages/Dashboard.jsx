import { useNavigate } from 'react-router-dom';
import { useCotizaciones } from '../hooks/useCotizaciones';
import { useFacturas } from '../hooks/useFacturas';
import { usePedidos } from '../hooks/usePedidos';
import { useClientes } from '../hooks/useClientes';
import { formatCurrency, calcTotales, formatDate } from '../utils/formatters';
import Header from '../components/layout/Header';
import Badge from '../components/ui/Badge';
import { ETAPAS, emptyEtapas, getEtapaActualIdx } from './produccion/Produccion';
import {
  FileText, Receipt, TrendingUp,
  ArrowRight, AlertCircle, CheckCircle, Clock,
  Scissors, Flame, Truck, CheckCircle2, Package2
} from 'lucide-react';

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 flex items-start gap-3 md:gap-4">
      <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm text-gray-400 font-medium">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const etapaIconMap = { corte: Scissors, templado: Flame, despacho: Truck };
const etapaColorMap = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400'    },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400'   },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: cotizaciones = [] } = useCotizaciones();
  const { data: facturas = [] } = useFacturas();
  const { data: pedidos = [] } = usePedidos();
  const { data: clientes = [] } = useClientes();

  const cotsPorEstado = {
    borrador:  cotizaciones.filter(c => c.estado === 'borrador').length,
    enviada:   cotizaciones.filter(c => c.estado === 'enviada').length,
    aprobada:  cotizaciones.filter(c => c.estado === 'aprobada').length,
    rechazada: cotizaciones.filter(c => c.estado === 'rechazada').length,
  };

  const facturasAceptadas = facturas.filter(f => f.estadoDian === 'aceptada');
  const facturasPendientes = facturas.filter(f => f.estadoDian === 'pendiente');

  const totalFacturado = facturasAceptadas.reduce((sum, f) => {
    const t = calcTotales(f.items ?? [], f.descuento || 0);
    return sum + t.total;
  }, 0);

  const pedidosActivos = pedidos.filter(p => p.estado !== 'completado');
  const prodCounters = { corte: 0, templado: 0, despacho: 0, completado: 0, total: 0 };
  const itemsEnProceso = [];

  pedidosActivos.forEach(pedido => {
    const cliente = clientes.find(c => c.id === pedido.clienteId);
    (pedido.items ?? []).forEach(item => {
      const etapas = item.etapas || emptyEtapas();
      const idx = getEtapaActualIdx(etapas);
      prodCounters.total++;
      if (idx === ETAPAS.length) prodCounters.completado++;
      else {
        prodCounters[ETAPAS[idx].key]++;
        itemsEnProceso.push({ item, pedido, cliente, etapaActualIdx: idx, etapas });
      }
    });
  });

  const recentCots = [...cotizaciones]
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
    .slice(0, 5);

  const getCliente = (id) => clientes.find(c => c.id === id);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" subtitle="Resumen ejecutivo · Indusvit S.A.S." />

      <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KpiCard
            icon={FileText}
            label="Cotizaciones activas"
            value={cotsPorEstado.enviada + cotsPorEstado.borrador}
            sub={`${cotsPorEstado.aprobada} aprobadas`}
            color="bg-brand-600"
          />
          <KpiCard
            icon={Receipt}
            label="Facturado (DIAN)"
            value={formatCurrency(totalFacturado)}
            sub={`${facturasAceptadas.length} facturas aceptadas`}
            color="bg-emerald-500"
          />
          <KpiCard
            icon={Package2}
            label="Ítems en fabricación"
            value={prodCounters.total - prodCounters.completado}
            sub={`${prodCounters.completado} completados`}
            color="bg-amber-500"
          />
          <KpiCard
            icon={TrendingUp}
            label="Pendientes DIAN"
            value={facturasPendientes.length}
            sub="Requieren envío"
            color="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Cotizaciones recientes */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-700">Cotizaciones recientes</h2>
              <button
                onClick={() => navigate('/cotizaciones')}
                className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Ver todas <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentCots.map(cot => {
                const cliente = getCliente(cot.clienteId);
                const totales = calcTotales(cot.items ?? [], cot.descuento || 0);
                return (
                  <div
                    key={cot.id}
                    className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/cotizaciones/${cot.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{cot.id}</p>
                      <p className="text-xs text-gray-400 truncate">{cliente?.razonSocial}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-700">{formatCurrency(totales.total)}</p>
                      <p className="text-xs text-gray-400">{formatDate(cot.fecha)}</p>
                    </div>
                    <Badge status={cot.estado} />
                  </div>
                );
              })}
              {recentCots.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">No hay cotizaciones aún</div>
              )}
            </div>
          </div>

          {/* Pipeline */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-4 md:px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-700">Pipeline comercial</h2>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <PipelineItem icon={Clock} color="text-gray-400 bg-gray-50" label="Borradores" count={cotsPorEstado.borrador} />
              <PipelineItem icon={ArrowRight} color="text-blue-500 bg-blue-50" label="Enviadas" count={cotsPorEstado.enviada} />
              <PipelineItem icon={CheckCircle} color="text-emerald-500 bg-emerald-50" label="Aprobadas" count={cotsPorEstado.aprobada} />
              <PipelineItem icon={AlertCircle} color="text-red-400 bg-red-50" label="Rechazadas" count={cotsPorEstado.rechazada} />
            </div>
          </div>

        </div>

        {/* Producción */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="font-semibold text-gray-700">Estado de fabricación</h2>
              <p className="text-xs text-gray-400 mt-0.5">{prodCounters.total} ítems en producción</p>
            </div>
            <button
              onClick={() => navigate('/produccion')}
              className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Tablero completo <ArrowRight size={14} />
            </button>
          </div>

          {/* Contadores por etapa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-gray-50 border-b border-gray-50">
            {ETAPAS.map(etapa => {
              const EtapaIcon = etapaIconMap[etapa.key];
              const c = etapaColorMap[etapa.color];
              return (
                <div key={etapa.key} className="flex items-center gap-3 px-5 py-4">
                  <div className={`p-2 rounded-lg ${c.bg}`}>
                    <EtapaIcon size={15} className={c.text} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{etapa.label}</p>
                    <p className="text-xl font-bold text-gray-800">{prodCounters[etapa.key]}</p>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="p-2 rounded-lg bg-emerald-50">
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Completados</p>
                <p className="text-xl font-bold text-gray-800">{prodCounters.completado}</p>
              </div>
            </div>
          </div>

          {/* Ítems activos (máx 4) */}
          {itemsEnProceso.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No hay ítems activos en producción</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {itemsEnProceso.slice(0, 4).map(({ item, pedido, cliente, etapaActualIdx, etapas }) => {
                const etapaActual = ETAPAS[etapaActualIdx];
                const completadas = ETAPAS.filter(e => etapas[e.key]?.completado).length;
                return (
                  <div
                    key={`${pedido.id}-${item.id}`}
                    className="flex items-center gap-4 px-4 md:px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{item.descripcion}</p>
                      <p className="text-xs text-gray-400 truncate">{pedido.id} · {cliente?.razonSocial}</p>
                    </div>
                    {/* Mini stepper */}
                    <div className="flex items-center gap-1 shrink-0">
                      {ETAPAS.map((etapa, i) => {
                        const done = etapas[etapa.key]?.completado;
                        const isCurrent = !done && i === etapaActualIdx;
                        const c = etapaColorMap[etapa.color];
                        return (
                          <div key={etapa.key} className="flex items-center gap-0.5">
                            {i > 0 && <div className={`w-4 h-px ${done || i < etapaActualIdx ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              done ? 'bg-emerald-100' : isCurrent ? c.bg : 'bg-gray-100'
                            }`}>
                              {done
                                ? <CheckCircle2 size={11} className="text-emerald-600" />
                                : isCurrent
                                  ? <Clock size={11} className={c.text} />
                                  : <CircleIcon size={11} className="text-gray-300" />
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-gray-600">{etapaActual?.label}</p>
                      <p className="text-xs text-gray-400">{completadas}/{ETAPAS.length} etapas</p>
                    </div>
                  </div>
                );
              })}
              {itemsEnProceso.length > 4 && (
                <div
                  className="px-6 py-2.5 text-xs text-brand-600 hover:text-brand-700 cursor-pointer font-medium text-center hover:bg-gray-50"
                  onClick={() => navigate('/produccion')}
                >
                  Ver {itemsEnProceso.length - 4} ítems más →
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function PipelineItem({ icon: Icon, color, label, count }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon size={14} />
      </div>
      <span className="flex-1 text-sm text-gray-600">{label}</span>
      <span className="text-sm font-bold text-gray-700">{count}</span>
    </div>
  );
}

function CircleIcon({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
