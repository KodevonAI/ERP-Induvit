import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Receipt, ClipboardList,
  Package, Users, ChevronRight, X, Settings, LogOut, Factory,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { useAuth } from '../../store/AuthContext';

const nav = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/cotizaciones', label: 'Cotizaciones',  icon: FileText },
  { to: '/facturas',     label: 'Facturación',   icon: Receipt },
  { to: '/pedidos',      label: 'Pedidos Fab.',  icon: ClipboardList },
  { to: '/produccion',   label: 'Producción',    icon: Factory },
  { divider: true },
  { to: '/clientes',     label: 'Clientes',      icon: Users },
  { to: '/productos',    label: 'Productos',     icon: Package },
  { divider: true },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar() {
  const { setSidebarOpen } = useLayout();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    setSidebarOpen(false);
    logout();
  }

  return (
    <aside className="flex flex-col w-60 h-screen bg-brand-950 text-white overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-brand-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 border border-white/20 shrink-0">
          <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
            <polygon points="4,28 16,4 28,28" fillOpacity="0.3" />
            <polygon points="4,28 16,10 28,28" fillOpacity="0.5" />
            <polygon points="8,28 16,14 24,28" fillOpacity="1" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight tracking-wide">INDUSVIT</p>
          <p className="text-[10px] text-brand-300 leading-tight">ERP Manufactura</p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-brand-300 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) =>
          item.divider ? (
            <div key={i} className="my-3 border-t border-brand-800" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white font-medium'
                    : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={17} className={isActive ? 'text-white' : 'text-brand-400 group-hover:text-white'} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-brand-300" />}
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      {/* Usuario + logout */}
      <div className="px-3 pb-3 pt-2 border-t border-brand-800">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-800 cursor-pointer transition-colors"
          onClick={() => { navigate('/configuracion'); setSidebarOpen(false); }}
        >
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {profile.nombre.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile.nombre}</p>
            <p className="text-[10px] text-brand-400 truncate">{profile.cargo}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 mt-0.5 rounded-lg text-brand-400 hover:text-red-400 hover:bg-red-900/20 text-xs transition-colors"
        >
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
