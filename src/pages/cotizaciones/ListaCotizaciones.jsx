import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calcTotales, formatDate } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import { Plus, Search, FileText } from 'lucide-react';
import { useState } from 'react';

export default function ListaCotizaciones() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const clientes = state.clientes;

  const filtered = state.cotizaciones
    .filter(c => {
      const cliente = clientes.find(cl => cl.id === c.clienteId);
      const q = search.toLowerCase();
      const matchSearch =
        c.id.toLowerCase().includes(q) ||
        (cliente?.razonSocial.toLowerCase().includes(q)) ||
        c.vendedor.toLowerCase().includes(q);
      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
      return matchSearch && matchEstado;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Cotizaciones"
        subtitle={`${state.cotizaciones.length} cotizaciones registradas`}
      />

      <div className="flex-1 p-4 md:p-8">
        <div className="bg-white rounded-xl border border-gray-100">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-50">
            <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cotización..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
            <button
              onClick={() => navigate('/cotizaciones/nueva')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors ml-auto"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva cotización</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">N° Cotización</th>
                  <th className="text-left px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                  <th className="text-left px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Vigencia</th>
                  <th className="text-left px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Vendedor</th>
                  <th className="text-right px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 md:px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No se encontraron cotizaciones</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(cot => {
                    const cliente = clientes.find(c => c.id === cot.clienteId);
                    const totales = calcTotales(cot.items);
                    return (
                      <tr
                        key={cot.id}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/cotizaciones/${cot.id}`)}
                      >
                        <td className="px-4 md:px-5 py-3.5 font-medium text-brand-600 whitespace-nowrap">{cot.id}</td>
                        <td className="px-4 md:px-5 py-3.5">
                          <p className="font-medium text-gray-700 truncate max-w-[160px] md:max-w-none">{cliente?.razonSocial || '-'}</p>
                          <p className="text-xs text-gray-400">{cliente?.nit}</p>
                        </td>
                        <td className="px-4 md:px-5 py-3.5 text-gray-500 hidden md:table-cell whitespace-nowrap">{formatDate(cot.fecha)}</td>
                        <td className="px-4 md:px-5 py-3.5 text-gray-500 hidden lg:table-cell whitespace-nowrap">{formatDate(cot.vigencia)}</td>
                        <td className="px-4 md:px-5 py-3.5 text-gray-500 hidden lg:table-cell">{cot.vendedor}</td>
                        <td className="px-4 md:px-5 py-3.5 text-right font-semibold text-gray-700 whitespace-nowrap">
                          {formatCurrency(totales.total)}
                        </td>
                        <td className="px-4 md:px-5 py-3.5 text-center">
                          <Badge status={cot.estado} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
