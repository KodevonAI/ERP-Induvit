import { useState } from 'react';
import { useStore } from '../store/useStore';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Users, Phone, Mail, MapPin, Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';

const EMPTY = {
  razonSocial: '', nit: '', email: '', telefono: '',
  ciudad: '', departamento: '', direccion: '', contacto: '',
  regimen: 'Responsable de IVA',
};

const REGIMENES = ['Responsable de IVA', 'No responsable de IVA', 'Gran contribuyente', 'Régimen simple'];
const DEPARTAMENTOS = ['Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Cauca', 'Cesar', 'Córdoba', 'Cundinamarca', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Quindío', 'Risaralda', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca'];

function nextClienteId(clientes) {
  const nums = clientes.map(c => parseInt(c.id.replace('C', ''), 10)).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `C${String(next).padStart(3, '0')}`;
}

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

export default function Clientes() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = nuevo, objeto = editar
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = state.clientes.filter(c => {
    const q = search.toLowerCase();
    return c.razonSocial.toLowerCase().includes(q) || c.nit.includes(q) || c.ciudad.toLowerCase().includes(q);
  });

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ ...c });
    setModalOpen(true);
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleSave() {
    if (!form.razonSocial.trim() || !form.nit.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_CLIENTE', payload: { ...form, id: editing.id } });
    } else {
      dispatch({ type: 'ADD_CLIENTE', payload: { ...form, id: nextClienteId(state.clientes) } });
    }
    setModalOpen(false);
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_CLIENTE', payload: id });
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Clientes" subtitle={`${state.clientes.length} clientes registrados`} />

      <div className="flex-1 p-4 md:p-8 space-y-4">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors ml-auto"
          >
            <Plus size={16} /> Nuevo cliente
          </button>
        </div>

        {/* Grid de tarjetas */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={36} className="mx-auto mb-2 opacity-20" />
            <p>No se encontraron clientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-brand-200 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-700 truncate">{c.razonSocial}</p>
                        <p className="text-xs text-gray-400 mt-0.5">NIT: {c.nit}</p>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmId(c.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={12} className="text-gray-300 shrink-0" />
                        <span className="truncate">{c.direccion}, {c.ciudad}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={12} className="text-gray-300 shrink-0" />
                        <span>{c.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail size={12} className="text-gray-300 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-400">Contacto: <strong className="text-gray-500">{c.contacto}</strong></p>
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">{c.regimen}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear / editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label required>Razón social</Label>
            <Input
              type="text"
              placeholder="Nombre completo o razón social"
              value={form.razonSocial}
              onChange={e => setField('razonSocial', e.target.value)}
            />
          </div>
          <div>
            <Label required>NIT</Label>
            <Input
              type="text"
              placeholder="900.123.456-7"
              value={form.nit}
              onChange={e => setField('nit', e.target.value)}
            />
          </div>
          <div>
            <Label>Régimen tributario</Label>
            <Select value={form.regimen} onChange={e => setField('regimen', e.target.value)}>
              {REGIMENES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              type="text"
              placeholder="601 234 5678"
              value={form.telefono}
              onChange={e => setField('telefono', e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="contacto@empresa.com"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Dirección</Label>
            <Input
              type="text"
              placeholder="Cra 15 # 93-47 Of. 501"
              value={form.direccion}
              onChange={e => setField('direccion', e.target.value)}
            />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input
              type="text"
              placeholder="Bogotá"
              value={form.ciudad}
              onChange={e => setField('ciudad', e.target.value)}
            />
          </div>
          <div>
            <Label>Departamento</Label>
            <Select value={form.departamento} onChange={e => setField('departamento', e.target.value)}>
              <option value="">Seleccionar...</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Persona de contacto</Label>
            <Input
              type="text"
              placeholder="Nombre del contacto principal"
              value={form.contacto}
              onChange={e => setField('contacto', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.razonSocial.trim() || !form.nit.trim()}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {editing ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => handleDelete(confirmId)}
        title="Eliminar cliente"
        message="Esta acción no se puede deshacer. ¿Deseas eliminar este cliente?"
      />
    </div>
  );
}
