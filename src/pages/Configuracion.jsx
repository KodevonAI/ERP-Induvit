import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useStore } from '../store/useStore';
import Header from '../components/layout/Header';
import {
  User, Lock, Building2, ShieldCheck, Save,
  CheckCircle, AlertCircle, LogOut, RotateCcw, Info
} from 'lucide-react';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
        <Icon size={17} className="text-brand-600" />
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InputField({ ...props }) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
    />
  );
}

function Toast({ type, message, onClose }) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-red-50 border-red-200 text-red-600',
  };
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm ${styles[type]}`}>
      <Icon size={16} />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

export default function Configuracion() {
  const { profile, updateProfile, session, logout } = useAuth();
  const { dispatch } = useStore();

  // Perfil
  const [perfil, setPerfil] = useState({ ...profile });
  const [perfilDirty, setPerfilDirty] = useState(false);

  // Contraseña
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [showPass, setShowPass] = useState(false);

  // Toast
  const [toast, setToast] = useState({ type: '', msg: '' });

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: '', msg: '' }), 3500);
  }

  function setPerfilField(k, v) {
    setPerfil(p => ({ ...p, [k]: v }));
    setPerfilDirty(true);
  }

  function savePerfil() {
    updateProfile(perfil);
    setPerfilDirty(false);
    showToast('success', 'Perfil actualizado correctamente.');
  }

  function savePassword() {
    const { actual, nueva, confirmar } = passForm;
    if (actual !== 'indusvit123') {
      showToast('error', 'La contraseña actual es incorrecta.');
      return;
    }
    if (nueva.length < 6) {
      showToast('error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nueva !== confirmar) {
      showToast('error', 'Las contraseñas no coinciden.');
      return;
    }
    setPassForm({ actual: '', nueva: '', confirmar: '' });
    showToast('success', 'Contraseña actualizada (modo demo).');
  }

  function resetDemo() {
    if (!window.confirm('¿Restablecer todos los datos de demo? Esto borrará cambios locales.')) return;
    dispatch({ type: 'RESET' });
    showToast('success', 'Datos de demo restablecidos correctamente.');
  }

  const loginDate = session?.loginAt
    ? new Date(session.loginAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
    : '-';

  return (
    <div className="flex flex-col flex-1">
      <Header title="Configuración" subtitle="Gestiona tu perfil y preferencias del sistema" />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl space-y-5">

          {/* Perfil */}
          <Section title="Mi perfil" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre completo">
                <InputField
                  type="text"
                  value={perfil.nombre}
                  onChange={e => setPerfilField('nombre', e.target.value)}
                />
              </Field>
              <Field label="Cargo">
                <InputField
                  type="text"
                  value={perfil.cargo}
                  onChange={e => setPerfilField('cargo', e.target.value)}
                />
              </Field>
              <Field label="Correo electrónico">
                <InputField
                  type="email"
                  value={perfil.email}
                  onChange={e => setPerfilField('email', e.target.value)}
                />
              </Field>
              <Field label="Teléfono">
                <InputField
                  type="text"
                  value={perfil.telefono}
                  onChange={e => setPerfilField('telefono', e.target.value)}
                />
              </Field>
              <Field label="Usuario (no editable)">
                <InputField
                  type="text"
                  value={session?.username || ''}
                  disabled
                  className="bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </Field>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={savePerfil}
                disabled={!perfilDirty}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} /> Guardar perfil
              </button>
            </div>
          </Section>

          {/* Empresa */}
          <Section title="Información de empresa" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Razón social">
                <InputField
                  type="text"
                  value={perfil.empresa}
                  onChange={e => setPerfilField('empresa', e.target.value)}
                />
              </Field>
              <Field label="NIT">
                <InputField
                  type="text"
                  value={perfil.nitEmpresa}
                  onChange={e => setPerfilField('nitEmpresa', e.target.value)}
                />
              </Field>
              <Field label="Dirección principal">
                <InputField
                  type="text"
                  value={perfil.direccionEmpresa}
                  onChange={e => setPerfilField('direccionEmpresa', e.target.value)}
                />
              </Field>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={savePerfil}
                disabled={!perfilDirty}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} /> Guardar
              </button>
            </div>
          </Section>

          {/* Seguridad */}
          <Section title="Cambiar contraseña" icon={Lock}>
            <div className="space-y-4 max-w-sm">
              <Field label="Contraseña actual">
                <div className="relative">
                  <InputField
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passForm.actual}
                    onChange={e => setPassForm(f => ({ ...f, actual: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? 'ocultar' : 'ver'}
                  </button>
                </div>
              </Field>
              <Field label="Nueva contraseña">
                <InputField
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={passForm.nueva}
                  onChange={e => setPassForm(f => ({ ...f, nueva: e.target.value }))}
                />
              </Field>
              <Field label="Confirmar nueva contraseña">
                <InputField
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  value={passForm.confirmar}
                  onChange={e => setPassForm(f => ({ ...f, confirmar: e.target.value }))}
                />
              </Field>
              <button
                onClick={savePassword}
                disabled={!passForm.actual || !passForm.nueva || !passForm.confirmar}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck size={14} /> Actualizar contraseña
              </button>
            </div>
          </Section>

          {/* Sesión activa */}
          <Section title="Sesión activa" icon={Info}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Usuario conectado</p>
                <p className="font-medium text-gray-700">{session?.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Inicio de sesión</p>
                <p className="font-medium text-gray-700">{loginDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut size={14} /> Cerrar sesión
              </button>
              <button
                onClick={resetDemo}
                className="flex items-center gap-2 px-4 py-2 border border-amber-200 text-amber-600 text-sm rounded-lg hover:bg-amber-50 transition-colors"
              >
                <RotateCcw size={14} /> Restablecer datos demo
              </button>
            </div>
          </Section>

        </div>
      </div>

      <Toast type={toast.type} message={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />
    </div>
  );
}
