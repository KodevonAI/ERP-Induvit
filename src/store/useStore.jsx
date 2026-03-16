import { createContext, useContext, useReducer, useEffect } from 'react';
import clientesData from '../data/clientes.json';
import productosData from '../data/productos.json';
import cotizacionesData from '../data/cotizaciones.json';
import facturasData from '../data/facturas.json';
import pedidosData from '../data/pedidos.json';

const STORAGE_KEY = 'indusvit_erp_data';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    clientes: clientesData,
    productos: productosData,
    cotizaciones: cotizacionesData,
    facturas: facturasData,
    pedidos: pedidosData,
  };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      clientes: state.clientes,
      productos: state.productos,
      cotizaciones: state.cotizaciones,
      facturas: state.facturas,
      pedidos: state.pedidos,
    }));
  } catch {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE':
      return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLIENTE':
      return { ...state, clientes: state.clientes.filter(c => c.id !== action.payload) };

    case 'ADD_PRODUCTO':
      return { ...state, productos: [...state.productos, action.payload] };
    case 'UPDATE_PRODUCTO':
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload) };

    case 'ADD_COTIZACION':
      return { ...state, cotizaciones: [...state.cotizaciones, action.payload] };

    case 'UPDATE_COTIZACION':
      return {
        ...state,
        cotizaciones: state.cotizaciones.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'ADD_FACTURA':
      return { ...state, facturas: [...state.facturas, action.payload] };

    case 'UPDATE_FACTURA':
      return {
        ...state,
        facturas: state.facturas.map(f =>
          f.id === action.payload.id ? action.payload : f
        ),
      };

    case 'ADD_PEDIDO':
      return { ...state, pedidos: [...state.pedidos, action.payload] };

    case 'UPDATE_PEDIDO':
      return {
        ...state,
        pedidos: state.pedidos.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'RESET':
      return {
        clientes: clientesData,
        productos: productosData,
        cotizaciones: cotizacionesData,
        facturas: facturasData,
        pedidos: pedidosData,
      };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
