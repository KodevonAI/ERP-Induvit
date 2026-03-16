import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from './LayoutContext';
import { useAuth } from '../../store/AuthContext';

export default function Header({ title, subtitle }) {
  const { setSidebarOpen } = useLayout();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
        <button
          onClick={() => navigate('/configuracion')}
          className="flex items-center gap-2 pl-2 md:pl-3 border-l border-gray-100 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0 text-sm font-bold text-white">
            {profile.nombre.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-700 leading-tight">{profile.nombre}</p>
            <p className="text-xs text-gray-400 leading-tight">{profile.cargo}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
