import { useState } from 'react';
import { useProductos, useCreateProducto, useUpdateProducto, useDeleteProducto, useToggleActivoProducto } from '../hooks/useProductos';
import { formatCurrency } from '../utils/formatters';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Package, Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const CATEGORIAS_LIST = ['Vidrio Templado', 'Vidrio Laminado', 'Vidrio Reflectivo', 'Vidrio Float', 'Vidrio Decorativo', 'Sistemas', 'Servicios'];
const CATEGORIAS_FILTER = ['Todas', ...CATEGORIAS_LIST];
const UNIDADES = ['m2', 'unidad', 'ml', 'hora', 'kg', 'rollo'];

const EMPTY_PROD = {
  codigo: '', nombre: '', descripcion: '', categoria: 'Vidrio Templado',
  espesor: '', unidad: 'm2', precioM2: '', precioPieza: '',
  iva: 19, stock: '', activo: true,
};

function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
    >
      {children}
    </select>
  );
}

export default function Productos() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PROD);
  const [confirmId, setConfirmId] = useState(null);
  const [showInactivos, setShowInactivos] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { data: productos = [], isLoading } = useProductos();
  const createProducto = useCreateProducto();
  const updateProducto = useUpdateProducto();
  const deleteProducto = useDeleteProducto();
  const toggleActivo = useToggleActivoProducto();

  const filtered = productos.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = (p.nombre ?? '').toLowerCase().includes(q) || (p.codigo ?? '').toLowerCase().includes(q);
    const matchCat = cat === 'Todas' || p.categoria === cat;
    const matchActivo = showInactivos ? true : p.activo;
    return matchSearch && matchCat && matchActivo;
  });

  function openNew() {
    setEditing(null);
    setForm(EMPTY_PROD);
    setSaveError('');
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      ...p,
      espesor: p.espesor ?? '',
      precioM2: p.precioM2 ?? '',
      precioPieza: p.precioPieza ?? '',
      stock: p.stock ?? '',
    });
    setSaveError('');
    setModalOpen(true);
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function parseOrNull(v) {
    const n = parseFloat(v);
    return v === '' || isNaN(n) ? null : n;
  }

  function handleSave() {
    if (!form.codigo.trim() || !form.nombre.trim()) return;
    const payload = {
      ...form,
      espesor: parseOrNull(form.espesor),
      precioM2: parseOrNull(form.precioM2),
      precioPieza: parseOrNull(form.precioPieza),
      stock: parseOrNull(form.stock),
      iva: Number(form.iva),
    };
    setSaveError('');
    const mutation = editing
      ? updateProducto.mutateAsync({ id: editing.id, ...payload })
      : createProducto.mutateAsync(payload);
    mutation
      .then(() => setModalOpen(false))
      .catch(err => setSaveError(err.response?.data?.message ?? 'Error al guardar'));
  }

  function handleDelete(id) {
    deleteProducto.mutate(id);
  }

  function handleToggle(p) {
    toggleActivo.mutate(p.id);
  }

  const activos = productos.filter(p => p.activo).length;
  const isSaving = createProducto.isPending || updateProducto.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <Header title="Catálogo de Productos" subtitle="Cargando..." />
        <div className="flex-1 flex items-center justify-center text-gray-400">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Catálogo de Productos"
        subtitle={`${activos} productos activos · ${productos.length} en total`}
      />

      <div className="flex-1 p-4 md:p-8">
        <div className="bg-white rounded-xl border border-gray-100">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-50">
            <div className="relative w-full sm:w-auto">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIAS_FILTER.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    cat === c ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowInactivos(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
                  showInactivos ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {showInactivos ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                Inactivos
              </button>
              <button
                onClick={openNew}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nuevo producto</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Código</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Categoría</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Espesor</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Unidad</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Precio/m²</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Precio/Und.</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">IVA</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-16 text-gray-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No se encontraron productos</p>
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3 font-mono text-xs text-brand-600 font-medium">{p.codigo}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-700">{p.nombre}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.descripcion}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{p.categoria}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.espesor ? `${p.espesor}mm` : '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.unidad}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.precioM2 ? formatCurrency(p.precioM2) : '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.precioPieza ? formatCurrency(p.precioPieza) : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.iva > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.iva}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.stock !== null
                        ? <span className={`text-xs font-medium ${p.stock < 20 ? 'text-red-500' : 'text-gray-600'}`}>{p.stock}</span>
                        : <span className="text-gray-300">-</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(p)} title={p.activo ? 'Desactivar' : 'Activar'}>
                        {p.activo
                          ? <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Activo</span>
                          : <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Inactivo</span>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal crear / editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Código</Label>
            <Input
              type="text"
              placeholder="VT-4"
              value={form.codigo}
              onChange={e => setField('codigo', e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <Label required>Categoría</Label>
            <Select value={form.categoria} onChange={e => setField('categoria', e.target.value)}>
              {CATEGORIAS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label required>Nombre</Label>
            <Input
              type="text"
              placeholder="Vidrio Templado 6mm"
              value={form.nombre}
              onChange={e => setField('nombre', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <textarea
              rows={2}
              placeholder="Descripción técnica del producto..."
              value={form.descripcion}
              onChange={e => setField('descripcion', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div>
            <Label>Espesor (mm)</Label>
            <Input
              type="number" min="0" placeholder="6"
              value={form.espesor}
              onChange={e => setField('espesor', e.target.value)}
            />
          </div>
          <div>
            <Label required>Unidad de medida</Label>
            <Select value={form.unidad} onChange={e => setField('unidad', e.target.value)}>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>
          <div>
            <Label>Precio por m² (COP)</Label>
            <Input
              type="number" min="0" placeholder="125000"
              value={form.precioM2}
              onChange={e => setField('precioM2', e.target.value)}
            />
          </div>
          <div>
            <Label>Precio por unidad (COP)</Label>
            <Input
              type="number" min="0" placeholder="1850000"
              value={form.precioPieza}
              onChange={e => setField('precioPieza', e.target.value)}
            />
          </div>
          <div>
            <Label>IVA</Label>
            <Select value={form.iva} onChange={e => setField('iva', Number(e.target.value))}>
              <option value={0}>0% — Exento</option>
              <option value={19}>19% — General</option>
            </Select>
          </div>
          <div>
            <Label>Stock (unidades)</Label>
            <Input
              type="number" min="0" placeholder="100"
              value={form.stock}
              onChange={e => setField('stock', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setField('activo', !form.activo)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.activo ? 'bg-brand-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-gray-600">{form.activo ? 'Producto activo' : 'Producto inactivo'}</span>
            </label>
          </div>
        </div>

        {saveError && (
          <p className="mt-3 text-sm text-red-500">{saveError}</p>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.codigo.trim() || !form.nombre.trim() || isSaving}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { handleDelete(confirmId); setConfirmId(null); }}
        title="Eliminar producto"
        message="Esta acción no se puede deshacer. El producto será eliminado del catálogo."
      />
    </div>
  );
}
