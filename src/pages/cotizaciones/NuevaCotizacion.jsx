import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '../../hooks/useClientes';
import { useProductos } from '../../hooks/useProductos';
import { useCreateCotizacion } from '../../hooks/useCotizaciones';
import { calcItemSubtotal, calcItemIva, calcTotales, formatCurrency } from '../../utils/formatters';
import Header from '../../components/layout/Header';
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const today = () => new Date().toISOString().split('T')[0];
const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
};

function emptyItem(productos) {
  const p = productos[0];
  return {
    id: uuidv4(),
    productoId: p?.id || '',
    descripcion: p?.descripcion || '',
    ancho: '',
    alto: '',
    area: '',
    cantidad: 1,
    unidad: p?.unidad || 'm2',
    precioUnitario: p?.precioM2 || p?.precioPieza || 0,
    iva: p?.iva || 19,
  };
}

export default function NuevaCotizacion() {
  const navigate = useNavigate();
  const { data: clientes = [] } = useClientes();
  const { data: productosAll = [] } = useProductos();
  const createCotizacion = useCreateCotizacion();

  const productos = productosAll.filter(p => p.activo);

  const [form, setForm] = useState({
    clienteId: '',
    vendedor: 'Santiago Ramírez',
    fecha: today(),
    vigencia: addDays(today(), 30),
    condicionesPago: '30 días',
    plazoEntrega: '15 días hábiles',
    observaciones: '',
    descuento: 0,
    items: [],
  });

  // Inicializar items una vez que los productos estén disponibles
  const [itemsInitialized, setItemsInitialized] = useState(false);
  if (!itemsInitialized && productos.length > 0) {
    setForm(f => ({ ...f, clienteId: clientes[0]?.id || '', items: [emptyItem(productos)] }));
    setItemsInitialized(true);
  }

  const [saveError, setSaveError] = useState('');

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setItem(idx, key, val) {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: val };
      if (key === 'ancho' || key === 'alto') {
        const ancho = key === 'ancho' ? parseFloat(val) || 0 : parseFloat(items[idx].ancho) || 0;
        const alto  = key === 'alto'  ? parseFloat(val) || 0 : parseFloat(items[idx].alto) || 0;
        if (ancho > 0 && alto > 0) items[idx].area = (ancho * alto).toFixed(4);
      }
      return { ...f, items };
    });
  }

  function changeProduct(idx, productoId) {
    const p = productos.find(x => x.id === productoId);
    if (!p) return;
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], productoId: p.id, descripcion: p.descripcion, unidad: p.unidad, precioUnitario: p.precioM2 || p.precioPieza || 0, iva: p.iva };
      return { ...f, items };
    });
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, emptyItem(productos)] }));
  }

  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function parseNum(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function getComputedItems() {
    return form.items.map(it => ({
      ...it,
      cantidad: parseNum(it.cantidad),
      precioUnitario: parseNum(it.precioUnitario),
      iva: parseNum(it.iva),
      area: it.area ? parseNum(it.area) : null,
      ancho: it.ancho ? parseNum(it.ancho) : null,
      alto: it.alto ? parseNum(it.alto) : null,
    }));
  }

  async function guardar(estado) {
    setSaveError('');
    const payload = {
      clienteId: form.clienteId,
      vendedor: form.vendedor,
      fecha: form.fecha,
      vigencia: form.vigencia,
      condicionesPago: form.condicionesPago,
      plazoEntrega: form.plazoEntrega,
      observaciones: form.observaciones,
      descuento: parseNum(form.descuento),
      estado,
      items: getComputedItems().map(({ id, ...rest }) => rest),
    };
    try {
      const cotizacion = await createCotizacion.mutateAsync(payload);
      navigate(`/cotizaciones/${cotizacion.id}`);
    } catch (err) {
      setSaveError(err.response?.data?.message ?? 'Error al guardar la cotización');
    }
  }

  const computedItems = getComputedItems();
  const totales = calcTotales(computedItems, parseNum(form.descuento));
  const condPago = ['Contado', '15 días', '30 días', '45 días', '60 días', '50% anticipo, 50% contra entrega'];
  const plazos = ['5 días hábiles', '8 días hábiles', '10 días hábiles', '15 días hábiles', '20 días hábiles', '30 días hábiles'];
  const saving = createCotizacion.isPending;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Nueva Cotización" subtitle="Ingrese los datos de la cotización" />

      <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Encabezado */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Información general</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Cliente *</label>
              <select
                value={form.clienteId}
                onChange={e => setField('clienteId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Vendedor *</label>
              <input
                type="text" value={form.vendedor}
                onChange={e => setField('vendedor', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha *</label>
              <input
                type="date" value={form.fecha}
                onChange={e => setField('fecha', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Vigencia hasta *</label>
              <input
                type="date" value={form.vigencia}
                onChange={e => setField('vigencia', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Condiciones de pago</label>
              <select
                value={form.condicionesPago}
                onChange={e => setField('condicionesPago', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {condPago.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Plazo de entrega</label>
              <select
                value={form.plazoEntrega}
                onChange={e => setField('plazoEntrega', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {plazos.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {form.clienteId && (() => {
            const c = clientes.find(x => x.id === form.clienteId);
            return c ? (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <span><strong>NIT:</strong> {c.nit}</span>
                <span><strong>Ciudad:</strong> {c.ciudad}</span>
                <span><strong>Contacto:</strong> {c.contacto}</span>
                <span className="truncate"><strong>Email:</strong> {c.email}</span>
              </div>
            ) : null;
          })()}
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-700">Ítems</h3>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              <Plus size={15} /> Agregar ítem
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '900px' }}>
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-400">Cant.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Descripción</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-400">Ancho (m)</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-400">Alto (m)</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-400">Área (m²)</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400">Und.</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-gray-400">Precio/m²</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-gray-400">Precio Total</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-400">IVA%</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-gray-400">Total</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => {
                  const ci = computedItems[idx];
                  const precioTotal = calcItemSubtotal(ci);
                  const total = precioTotal + calcItemIva(ci);
                  return (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="px-3 py-2">
                        <input type="number" min="1" value={item.cantidad}
                          onChange={e => setItem(idx, 'cantidad', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500" style={{width:'56px'}}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.productoId}
                          onChange={e => changeProduct(idx, e.target.value)}
                          className="w-44 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {productos.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text" value={item.descripcion}
                          onChange={e => setItem(idx, 'descripcion', e.target.value)}
                          className="w-48 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" value={item.ancho}
                          onChange={e => setItem(idx, 'ancho', e.target.value)}
                          className="w-18 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500" style={{width:'68px'}}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" value={item.alto}
                          onChange={e => setItem(idx, 'alto', e.target.value)}
                          className="w-18 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500" style={{width:'68px'}}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.0001" min="0" value={item.area}
                          onChange={e => setItem(idx, 'area', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500 bg-blue-50" style={{width:'68px'}}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.unidad}
                          onChange={e => setItem(idx, 'unidad', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500" style={{width:'52px'}}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" value={item.precioUnitario}
                          onChange={e => setItem(idx, 'precioUnitario', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-brand-500" style={{width:'100px'}}
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-gray-700 whitespace-nowrap" style={{minWidth:'90px'}}>
                        {formatCurrency(precioTotal)}
                      </td>
                      <td className="px-3 py-2">
                        <select value={item.iva}
                          onChange={e => setItem(idx, 'iva', parseFloat(e.target.value))}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" style={{width:'64px'}}
                        >
                          <option value={0}>0%</option>
                          <option value={19}>19%</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          title="Eliminar ítem"
                          className="p-1.5 rounded-lg transition-colors text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="flex justify-end p-4 md:p-6 border-t border-gray-50">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(totales.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <label className="flex items-center gap-2">
                  <span>Descuento (%)</span>
                  <input
                    type="number" min="0" max="100" value={form.descuento}
                    onChange={e => setField('descuento', e.target.value)}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
                <span className="text-red-500">- {formatCurrency(totales.totalDescuento)}</span>
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
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Observaciones</h3>
          <textarea
            rows={3} value={form.observaciones}
            onChange={e => setField('observaciones', e.target.value)}
            placeholder="Condiciones especiales, notas para el cliente, instrucciones de entrega..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{saveError}</div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate('/cotizaciones')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => guardar('borrador')}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save size={15} /> Borrador
            </button>
            <button
              onClick={() => guardar('enviada')}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <Send size={15} /> {saving ? 'Guardando...' : 'Enviar al cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
