import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../../hooks/usePedidos';
import { useClientes } from '../../hooks/useClientes';
import { formatDate } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import { Search, ClipboardList } from 'lucide-react';

export default function ListaPedidos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const { data: pedidos = [] } = usePedidos();
  const { data: clientes = [] } = useClientes();

  const filtered = pedidos
    .filter(p => {
      const cliente = clientes.find(c => c.id === p.clienteId);
      const q = search.toLowerCase();
      const matchSearch =
        (p.id ?? '').toLowerCase().includes(q) ||
        (cliente?.razonSocial ?? '').toLowerCase().includes(q);
      const matchFiltro = filtro === 'todos' || p.estado === filtro;
      return matchSearch && matchFiltro;
    })
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Pedidos de Fabricación"
        subtitle="Órdenes de producción para el taller"
      />

      <div className="flex-1 p-4 md:p-8">
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-50">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedido..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">N° Pedido</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Factura</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Entrega estimada</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Responsable</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No se encontraron pedidos</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => {
                    const cliente = clientes.find(c => c.id === p.clienteId);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/pedidos/${p.id}`)}
                      >
                        <td className="px-5 py-3.5 font-medium text-brand-600">{p.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-700">{cliente?.razonSocial || '-'}</p>
                          <p className="text-xs text-gray-400">{cliente?.nit}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{p.facturaId}</td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(p.fecha)}</td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(p.fechaEntregaEstimada)}</td>
                        <td className="px-5 py-3.5 text-gray-500">{p.responsable}</td>
                        <td className="px-5 py-3.5 text-center"><Badge status={p.estado} /></td>
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
