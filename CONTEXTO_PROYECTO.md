# ERP Indusvit — Contexto del Proyecto

> **Última actualización:** 2026-03-15
> **Propósito:** Demo funcional para mostrar a clientes potenciales del ERP.

---

## Descripción general

ERP demo para **Indusvit S.A.S.**, empresa manufacturera de vidrio en Colombia (Bogotá).
Es una SPA completa en React que simula el flujo comercial real: cotización → factura electrónica → pedido de fabricación → producción.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + Vite 8 |
| Estilos | Tailwind CSS v3 |
| Routing | React Router v7 |
| Estado global | Context API + useReducer |
| Persistencia | localStorage (`indusvit_erp_data`) |
| Datos iniciales | JSON estáticos en `src/data/` |
| Íconos | lucide-react |
| IDs únicos | uuid v4 |
| Moneda | COP (formateo `es-CO`) |

---

## Credenciales de acceso (demo)

```
Usuario:    indusvit.admin
Contraseña: indusvit123
```

El perfil por defecto es **Santiago Ramírez** — Administrador del Sistema — `admin@indusvit.com`.
La sesión se persiste en `localStorage` bajo la key `indusvit_auth`.

---

## Estructura de carpetas

```
src/
├── App.jsx                        # Rutas + providers
├── main.jsx
├── index.css
├── store/
│   ├── useStore.jsx               # StoreProvider + reducer + localStorage
│   └── AuthContext.jsx            # AuthProvider (login/logout/profile)
├── utils/
│   ├── formatters.js              # formatCurrency, calcTotales, nextId, etc.
│   └── dian.js                    # Emulación envío DIAN (genera CUFE falso)
├── data/                          # JSON de datos iniciales
│   ├── clientes.json
│   ├── productos.json
│   ├── cotizaciones.json
│   ├── facturas.json
│   └── pedidos.json
├── components/
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── LayoutContext.jsx
│   └── ui/
│       ├── Badge.jsx              # Badges de estado (cotización, factura, etc.)
│       ├── Modal.jsx
│       └── ConfirmDialog.jsx
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Clientes.jsx               # Solo lectura
    ├── Productos.jsx              # CRUD de productos
    ├── Configuracion.jsx          # Perfil, empresa, contraseña, reset demo
    ├── cotizaciones/
    │   ├── ListaCotizaciones.jsx
    │   ├── NuevaCotizacion.jsx
    │   └── DetalleCotizacion.jsx
    ├── facturas/
    │   ├── ListaFacturas.jsx
    │   └── DetalleFactura.jsx
    ├── pedidos/
    │   ├── ListaPedidos.jsx
    │   ├── DetallePedido.jsx
    │   └── OrdenProduccion.jsx
    └── produccion/
        └── Produccion.jsx         # Tablero Kanban por etapas
```

---

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Dashboard | KPIs, cotizaciones recientes, pipeline, estado fabricación |
| `/cotizaciones` | ListaCotizaciones | Tabla filtrable |
| `/cotizaciones/nueva` | NuevaCotizacion | Formulario CRUD completo |
| `/cotizaciones/:id` | DetalleCotizacion | Ver, cambiar estado, aprobar y facturar |
| `/facturas` | ListaFacturas | Tabla con estado DIAN |
| `/facturas/:id` | DetalleFactura | Enviar a DIAN, generar pedido |
| `/pedidos` | ListaPedidos | Lista de pedidos de fabricación |
| `/pedidos/:id` | DetallePedido | Detalle con ítems y etapas |
| `/pedidos/:id/orden` | OrdenProduccion | Vista de orden de producción imprimible |
| `/produccion` | Produccion | Tablero completo de fabricación |
| `/clientes` | Clientes | Solo lectura |
| `/productos` | Productos | CRUD |
| `/configuracion` | Configuracion | Perfil, empresa, pass, reset |

---

## Flujo principal (el core del demo)

```
1. Nueva Cotización (/cotizaciones/nueva)
   ↓ Guardar como "borrador" o "enviar al cliente"

2. Detalle Cotización
   ↓ [Enviar al cliente] → estado: "enviada"
   ↓ [Aprobar y facturar] → crea Factura con estadoDian: "pendiente"
                          → cotización queda estado: "aprobada"

3. Detalle Factura (/facturas/:id)
   ↓ [Enviar a DIAN] → animación de 6 pasos (~5s)
                     → 95% éxito → estadoDian: "aceptada" + CUFE generado
                     → 5% error → estadoDian: "error"
   ↓ [Generar pedido de fabricación] → crea Pedido en estado: "pendiente"

4. Detalle Pedido (/pedidos/:id)
   → Ítems heredados de la factura con etapas vacías

5. Tablero de Producción (/produccion)
   → Por cada ítem: 3 etapas secuenciales: Corte → Templado → Despacho
   → Botón "Completar" por etapa
   → Cuando todos los ítems de un pedido terminan → pedido.estado = "completado"
```

---

## Estado global (useStore)

Toda la data se maneja con `useReducer` en `StoreProvider`. Se persiste automáticamente en `localStorage` en cada cambio.

**Acciones disponibles:**
- `ADD_CLIENTE`, `UPDATE_CLIENTE`, `DELETE_CLIENTE`
- `ADD_PRODUCTO`, `UPDATE_PRODUCTO`, `DELETE_PRODUCTO`
- `ADD_COTIZACION`, `UPDATE_COTIZACION`
- `ADD_FACTURA`, `UPDATE_FACTURA`
- `ADD_PEDIDO`, `UPDATE_PEDIDO`
- `RESET` → restaura todos los datos a los JSON iniciales

---

## Módulo de Producción — Etapas

Exportado desde `Produccion.jsx` y reutilizado en `Dashboard.jsx`:

```js
export const ETAPAS = [
  { key: 'corte',    label: 'Corte',    icon: Scissors, color: 'blue'    },
  { key: 'templado', label: 'Templado', icon: Flame,    color: 'amber'   },
  { key: 'despacho', label: 'Despacho', icon: Truck,    color: 'emerald' },
];
```

Cada ítem de pedido tiene:
```js
etapas: {
  corte:    { completado: false, fechaFin: null },
  templado: { completado: false, fechaFin: null },
  despacho: { completado: false, fechaFin: null },
}
```

**Funciones utilitarias clave exportadas:**
- `emptyEtapas()` — genera etapas vacías
- `getEtapaActualIdx(etapas)` — índice de la etapa actual (0, 1, 2 o 3 si completado)
- `derivarEstadoItem(etapas)` → `'pendiente'` | `'en_proceso'` | `'completado'`

---

## Cálculo de precios

```
Subtotal ítem = precioUnitario × área × cantidad
  donde área = ancho × alto (si se ingresan dimensiones) o 1 (precio por pieza)

IVA ítem = subtotal × (iva / 100)   // iva: 0% o 19%

Total cotización:
  subtotal = suma de subtotales
  descuento = subtotal × (descuentoPct / 100)
  IVA total = suma(IVA_ítem) × (1 - descuentoPct/100)   // descuento también aplica al IVA
  TOTAL = subtotal - descuento + IVA total
```

---

## Generación de IDs

```js
// nextId(list, prefix) → e.g. "COT-2026-001"
const year = new Date().getFullYear();
const next = Math.max(...list.map(x => parseInt(x.id.split('-').pop()))) + 1;
return `${prefix}-${year}-${String(next).padStart(3, '0')}`;
```

- Cotizaciones: `COT-YYYY-NNN`
- Facturas: `FAC-YYYY-NNN`
- Pedidos: `PF-YYYY-NNN`

---

## Emulación DIAN

El archivo `src/utils/dian.js` simula el proceso real:
- 6 pasos con delays (600–1000ms cada uno)
- 95% probabilidad de éxito
- En éxito: genera `cufe` (hash simulado de 96 chars), `fechaAceptacion`, `codigoRespuesta: '00'`
- En error: lanza `Error('Error DIAN [GE02]: Certificado digital vencido...')`

---

## Comandos

```bash
# Directorio
cd /Users/sebastian/Documents/kodevon/Proyectos/ERP-Induvit

# Desarrollo (puerto 5173)
npm run dev

# Build
npm run build

# Preview del build
npm run preview
```

---

## Datos demo precargados

Los JSON en `src/data/` incluyen:
- **Clientes:** empresas colombianas ficticias con NIT, dirección, régimen tributario
- **Productos:** catálogo de vidrios (templado, laminado, float, etc.) con precio/m², código, IVA
- **Cotizaciones, Facturas, Pedidos:** datos de ejemplo para poblar el dashboard desde el primer acceso

---

## Color brand

El color principal `brand-600` es un azul personalizado definido en `tailwind.config.js`.
Usado en botones primarios, sidebar activo, links y acentos.

---

## Lo que falta / posibles mejoras

- Módulo de Clientes: actualmente solo lectura (no tiene formulario CRUD)
- No hay exportación a PDF real (solo la vista de `OrdenProduccion.jsx` está pensada para imprimir)
- No hay backend — todo vive en localStorage
- La contraseña no se guarda realmente al cambiarla (solo muestra toast "modo demo")
- Sin soporte multi-usuario ni roles
- Sin integración real con DIAN
