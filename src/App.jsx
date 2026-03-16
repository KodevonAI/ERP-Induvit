import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/useStore.jsx';
import { AuthProvider, useAuth } from './store/AuthContext.jsx';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListaCotizaciones from './pages/cotizaciones/ListaCotizaciones';
import NuevaCotizacion from './pages/cotizaciones/NuevaCotizacion';
import DetalleCotizacion from './pages/cotizaciones/DetalleCotizacion';
import ListaFacturas from './pages/facturas/ListaFacturas';
import DetalleFactura from './pages/facturas/DetalleFactura';
import ListaPedidos from './pages/pedidos/ListaPedidos';
import DetallePedido from './pages/pedidos/DetallePedido';
import OrdenProduccion from './pages/pedidos/OrdenProduccion';
import Produccion from './pages/produccion/Produccion';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Configuracion from './pages/Configuracion';

function ProtectedApp() {
  const { session } = useAuth();

  if (!session) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cotizaciones" element={<ListaCotizaciones />} />
        <Route path="/cotizaciones/nueva" element={<NuevaCotizacion />} />
        <Route path="/cotizaciones/:id" element={<DetalleCotizacion />} />
        <Route path="/facturas" element={<ListaFacturas />} />
        <Route path="/facturas/:id" element={<DetalleFactura />} />
        <Route path="/pedidos" element={<ListaPedidos />} />
        <Route path="/pedidos/:id" element={<DetallePedido />} />
        <Route path="/pedidos/:id/orden" element={<OrdenProduccion />} />
        <Route path="/produccion" element={<Produccion />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <ProtectedApp />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
