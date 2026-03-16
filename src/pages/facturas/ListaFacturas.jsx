import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFacturas } from '../../hooks/useFacturas';
import { useClientes } from '../../hooks/useClientes';
import { formatCurrency, calcTotales, formatDate } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import { Search, Receipt } from 'lucide-react';

export default function ListaFacturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const { data: facturas = [] } = useFacturas();
  const { data: clientes = [] } = useClientes();

  const filtered = facturas
    .filter(f => {
      const cliente = clientes.find(c => c.id === f.clienteId);
      const q = search.toLowerCase();
      const matchSearch =
        (f.id ?? '').toLowerCase().includes(q) ||
        (cliente?.razonSocial ?? '').toLowerCase().includes(q);
      const matchFiltro = filtro === 'todos' || f.estadoDian === filtro;
      return matchSearch && matchFiltro;
    })
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Facturación Electrónica"
        subtitle="Gestión de facturas y envío a DIAN"
      />

      <div className="flex-1 p-4 md:p-8">
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-50">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar factura..."
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
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente DIAN</option>
              <option value="aceptada">Aceptada DIAN</option>
              <option value="error">Error DIAN</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">N° Factura</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cotización</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vencimiento</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado DIAN</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No se encontraron facturas</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(fac => {
                    const cliente = clientes.find(c => c.id === fac.clienteId);
                    const totales = calcTotales(fac.items ?? []);
                    return (
                      <tr
                        key={fac.id}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/facturas/${fac.id}`)}
                      >
                        <td className="px-5 py-3.5 font-medium text-brand-600">{fac.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-700">{cliente?.razonSocial || '-'}</p>
                          <p className="text-xs text-gray-400">{cliente?.nit}</p>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{fac.cotizacionId}</td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(fac.fecha)}</td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(fac.fechaVencimiento)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-700">{formatCurrency(totales.total)}</td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge status={fac.estadoDian} />
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
