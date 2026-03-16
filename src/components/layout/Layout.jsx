import { LayoutProvider, useLayout } from './LayoutContext';
import Sidebar from './Sidebar';

function LayoutInner({ children }) {
  const { sidebarOpen, setSidebarOpen } = useLayout();

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar siempre fixed; en desktop reservamos su ancho con un spacer */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar />
      </div>

      {/* Spacer desktop para empujar el contenido a la derecha del sidebar */}
      <div className="hidden lg:block w-60 shrink-0" />

      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <LayoutProvider>
      <LayoutInner>{children}</LayoutInner>
    </LayoutProvider>
  );
}
