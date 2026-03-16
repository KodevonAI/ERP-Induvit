import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePedido, useUpdatePedido } from '../../hooks/usePedidos';
import { useClientes } from '../../hooks/useClientes';
import { useProductos } from '../../hooks/useProductos';
import { formatDate } from '../../utils/formatters';
import { Printer, ArrowLeft, Save, CheckCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
const DT_OPTIONS = ['P1', 'P2', 'P3', 'NP'];

const PROCESOS_DEF = [
  { row: 1, groups: [
    { key: 'corte',      label: 'CORTE',          checks: ['corte_esp','corte_col','corte_dim','corte_cant'], checkLabels: ['ESP','COL','DIM','CANT'] },
    { key: 'trazab',     label: 'TRAZABILIDAD',   checks: ['trazabilidad'],          checkLabels: [''] },
    { key: 'filete',     label: 'FILETE',         checks: ['filete_va','filete_gu','filete_otros'], checkLabels: ['VA','GU','OTROS'],
      extra: [{ key: 'filete_acab', label: 'ACAB. BORDES' }] },
    { key: 'rectilinea', label: 'RECTILINEA',     checks: ['rectilinea'],            checkLabels: ['ACAB. BORDES'] },
    { key: 'pulpo',      label: 'PULPO',          checks: ['pulpo'],                 checkLabels: ['ACAB. BORDES'] },
  ]},
  { row: 2, groups: [
    { key: 'marcado',    label: 'MARCADO',        checks: ['marcado'],               checkLabels: ['TRAZOS'] },
    { key: 'perforado',  label: 'PERFORADO',      checks: ['perforado_diam','perforado_pos'], checkLabels: ['DIAM. PERF','POSICIÓN'] },
    { key: 'taladro',    label: 'TALADRO VER.',   checks: ['taladro_diam'],          checkLabels: ['DIAM. PERF'] },
    { key: 'cajeado',    label: 'CAJEADO',        checks: ['cajeado'],               checkLabels: ['DIMENSIÓN'] },
    { key: 'lavado',     label: 'LAVADO',         checks: ['lavado'],                checkLabels: ['APARIENCIA'] },
  ]},
  { row: 3, groups: [
    { key: 'temple',     label: 'TEMPLE',         checks: ['temple_esp','temple_col','temple_acab','temple_sello','temple_dim'], checkLabels: ['ESP','COL','ACAB','SELLO','DIM.'] },
    { key: 'entrega',    label: 'ENTREGA',        checks: ['entrega'],               checkLabels: ['APARIENCIA'] },
    { key: 'otros',      label: 'OTROS PROCESOS', checks: ['otros_procesos'],        checkLabels: ['APARIENCIA'] },
    { key: 'factura',    label: 'FACTURA No.',    checks: [],                        checkLabels: [], facturaField: true },
  ]},
];

const DEFAULT_PROCESOS = {
  corte_esp: false, corte_col: false, corte_dim: false, corte_cant: false,
  trazabilidad: false,
  filete_va: false, filete_gu: false, filete_otros: false, filete_acab: false,
  rectilinea: false, pulpo: false, marcado: false,
  perforado_diam: false, perforado_pos: false, taladro_diam: false,
  cajeado: false, lavado: false,
  temple_esp: false, temple_col: false, temple_acab: false, temple_sello: false, temple_dim: false,
  entrega: false, otros_procesos: false,
};

function defaultOp(prod) {
  return { color: prod?.color ?? 'INC', dt: 'P1', per: 0, des: 0, boq: 0,
           borde_a: prod?.espesor ? 2 : 0, borde_h: prod?.espesor ? 2 : 0,
           cha_a: 0, cha_h: 0, cc: 0 };
}

function calcBorde(op, item) {
  const a = parseFloat(item.ancho) || 0, h = parseFloat(item.alto) || 0, c = parseFloat(item.cantidad) || 0;
  if (!a || !h) return 0;
  return ((parseInt(op.borde_a) || 0) * a + (parseInt(op.borde_h) || 0) * h) * c;
}
function calcCha(op, item) {
  const a = parseFloat(item.ancho) || 0, h = parseFloat(item.alto) || 0, c = parseFloat(item.cantidad) || 0;
  if (!a || !h) return 0;
  return ((parseInt(op.cha_a) || 0) * a + (parseInt(op.cha_h) || 0) * h) * c;
}
function calcPeso(item, esp) {
  const area = parseFloat(item.area) || 0, cant = parseFloat(item.cantidad) || 0;
  if (!area || !esp) return 0;
  return area * cant * esp * 2.5;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OrdenProduccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: pedido, isLoading: pedLoading } = usePedido(id);
  const { data: clientes = [] } = useClientes();
  const { data: productos = [], isLoading: prodLoading } = useProductos();
  const updatePedido = useUpdatePedido();

  const [procesos, setProcesos] = useState(DEFAULT_PROCESOS);
  const [itemsOp,  setItemsOp]  = useState({});
  const [saved,    setSaved]    = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!pedLoading && !prodLoading && pedido && !initialized) {
      setProcesos({ ...DEFAULT_PROCESOS, ...(pedido.procesos || {}) });
      setItemsOp(Object.fromEntries(
        pedido.items.map(item => {
          const prod = productos.find(p => p.id === item.productoId);
          return [item.id, { ...defaultOp(prod), ...(item.op || {}) }];
        })
      ));
      setInitialized(true);
    }
  }, [pedLoading, prodLoading, pedido, productos, initialized]);

  if (pedLoading || prodLoading || !initialized) return <div className="p-8 text-gray-400">Cargando...</div>;
  if (!pedido) return <div className="p-8 text-gray-400">Pedido no encontrado.</div>;

  const cliente = clientes.find(c => c.id === pedido.clienteId);

  function toggleProceso(key) { setSaved(false); setProcesos(p => ({ ...p, [key]: !p[key] })); }
  function setOp(itemId, field, value) { setSaved(false); setItemsOp(p => ({ ...p, [itemId]: { ...p[itemId], [field]: value } })); }

  function guardar() {
    const items = pedido.items.map(it => ({ ...it, op: itemsOp[it.id] || it.op }));
    updatePedido.mutate({ id: pedido.id, procesos, items }, {
      onSuccess: () => setSaved(true),
    });
  }

  const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const opParts = pedido.id.replace(/^PF-/, '').split('-');
  const opNum   = `${opParts[0]}-${opParts[1] || '001'}`;

  const glassItems = pedido.items.filter(item => {
    const prod = productos.find(p => p.id === item.productoId);
    return prod?.espesor || (parseFloat(item.ancho) > 0 && parseFloat(item.alto) > 0);
  });

  const rows = glassItems.map((item, i) => {
    const prod  = productos.find(p => p.id === item.productoId);
    const op    = itemsOp[item.id] || defaultOp(prod);
    const esp   = prod?.espesor ?? 0;
    return { item, prod, op, esp, num: i + 1,
             borde: calcBorde(op, item), cha: calcCha(op, item), peso: calcPeso(item, esp) };
  });

  const tot = {
    cant:  rows.reduce((s, r) => s + (parseFloat(r.item.cantidad) || 0), 0),
    area:  rows.reduce((s, r) => s + (parseFloat(r.item.area) || 0),     0).toFixed(2),
    per:   rows.reduce((s, r) => s + (parseInt(r.op.per) || 0),          0),
    des:   rows.reduce((s, r) => s + (parseInt(r.op.des) || 0),          0),
    boq:   rows.reduce((s, r) => s + (parseInt(r.op.boq) || 0),          0),
    borde: rows.reduce((s, r) => s + r.borde,                            0).toFixed(2),
    cha:   rows.reduce((s, r) => s + r.cha,                              0).toFixed(2),
    cc:    rows.reduce((s, r) => s + (parseFloat(r.op.cc) || 0),         0).toFixed(2),
    peso:  rows.reduce((s, r) => s + r.peso,                             0).toFixed(2),
  };

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        /* ── Print ─────────────────────────────────── */
        @media print {
          @page { size: A4 portrait; margin: 7mm; }
          .no-print { display: none !important; }
          .print-page { background: white !important; padding: 0 !important; min-height: unset !important; }
          .print-scroll { overflow: visible !important; }
          .print-doc { box-shadow: none !important; border-radius: 0 !important;
                       max-width: 100% !important; margin: 0 !important; padding: 12px !important;
                       border: none !important; }
          input[type="text"], input[type="number"], select {
            border: none !important; background: transparent !important;
            padding: 0 !important; width: auto !important; font-size: inherit !important;
            box-shadow: none !important; -webkit-appearance: none; appearance: none; color: black !important;
          }
          input[type="checkbox"] { -webkit-appearance: checkbox; appearance: checkbox; }
        }
        /* ── Screen: custom checkbox ──────────────── */
        .proc-check { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; }
        .proc-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: #1d4ed8; cursor: pointer; }
        /* ── Input base ───────────────────────────── */
        .op-input {
          border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 3px;
          text-align: center; font-size: 10px; font-family: inherit;
          transition: border-color .15s, box-shadow .15s;
        }
        .op-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,.25); }
        .op-input.from-product { background: #eff6ff; color: #1d4ed8; }
        .op-input.user-input   { background: #fefce8; }
        .op-select { border: 1px solid #d1d5db; border-radius: 4px; padding: 2px; font-size: 10px;
                     font-family: inherit; background: #fefce8; cursor: pointer; }
        .op-select:focus { outline: none; border-color: #3b82f6; }
      `}</style>

      {/* ── Page shell ── */}
      <div className="print-page" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif' }}>

        {/* ── Toolbar ── */}
        <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0', padding: '10px 16px' }}>
          <div style={{ maxWidth: '940px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>

            <button onClick={() => navigate(`/pedidos/${id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <ArrowLeft size={14} /> <span>Volver</span>
            </button>

            <button onClick={guardar}
              disabled={updatePedido.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px',
                background: saved ? '#f0fdf4' : 'white',
                border: `1px solid ${saved ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '8px', fontSize: '13px',
                color: saved ? '#166534' : '#374151',
                cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                transition: 'all .2s', opacity: updatePedido.isPending ? 0.5 : 1 }}>
              {saved ? <CheckCircle size={14} /> : <Save size={14} />}
              <span>{updatePedido.isPending ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}</span>
            </button>

            <button onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 18px', background: '#1d4ed8', border: 'none', borderRadius: '8px', fontSize: '13px', color: 'white', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(29,78,216,.35)' }}>
              <Printer size={14} /> <span>Imprimir</span>
            </button>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', fontSize: '11px', color: '#9ca3af', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '3px', padding: '0 6px', color: '#1d4ed8', fontWeight: 'bold', fontSize: '10px' }}>abc</span>
                Del producto/ítem
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '3px', padding: '0 6px', fontSize: '10px' }}>abc</span>
                Ingreso manual
              </span>
            </div>
          </div>
        </div>

        {/* ── Document wrapper (enables horizontal scroll on mobile) ── */}
        <div className="print-scroll" style={{ padding: '24px 12px 40px', overflow: 'hidden' }}>
          <div style={{ maxWidth: '940px', margin: '0 auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>

            {/* ── Document card ── */}
            <div className="print-doc" style={{ minWidth: '820px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 32px rgba(0,0,0,.12), 0 1px 6px rgba(0,0,0,.06)', padding: '20px', fontSize: '11px' }}>

              {/* ══ HEADER ══ */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <tbody><tr>
                  <td style={{ width: '155px', padding: '10px 12px', borderRight: '2px solid #1e293b', textAlign: 'center', verticalAlign: 'middle', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '3px' }}>
                      <svg viewBox="0 0 32 32" style={{ width: '22px', height: '22px', fill: '#1e293b' }}>
                        <polygon points="4,28 16,4 28,28"  fillOpacity="0.18" />
                        <polygon points="4,28 16,10 28,28" fillOpacity="0.45" />
                        <polygon points="8,28 16,14 24,28" fillOpacity="1" />
                      </svg>
                      <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: '#0f172a' }}>INDUSVIT</span>
                      <sup style={{ fontSize: '7px', fontWeight: 'bold', color: '#475569' }}>LTDA</sup>
                    </div>
                    <div style={{ fontSize: '7px', color: '#64748b', lineHeight: '1.4', letterSpacing: '0.3px' }}>VIDRIOS TEMPLADOS PANORÁMICOS</div>
                  </td>

                  <td style={{ textAlign: 'center', padding: '10px 8px', borderRight: '2px solid #1e293b', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', color: '#475569', marginBottom: '4px' }}>ORDEN DE PRODUCCIÓN</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '2.5px', color: '#0f172a', margin: '4px 0' }}>TEMPLADO / LAMINADO</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', letterSpacing: '1px' }}>CALI</div>
                  </td>

                  <td style={{ width: '185px', padding: '10px 14px', textAlign: 'center', verticalAlign: 'middle', background: '#f8fafc' }}>
                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', letterSpacing: '1px', marginBottom: '6px' }}>O.P. N°</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <div style={{ border: '2.5px solid #1e293b', padding: '4px 12px', fontSize: '17px', fontWeight: '900', letterSpacing: '2px', color: '#0f172a', borderRadius: '4px' }}>
                        {opNum}
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#475569' }}>– 01</span>
                    </div>
                  </td>
                </tr></tbody>
              </table>

              {/* ══ CLIENT INFO ══ */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e293b', borderTop: 'none' }}>
                <tbody>
                  <tr>
                    <td colSpan={2} style={ic}>
                      <strong>Ciudad y Fecha</strong>&ensp;
                      <Blue>{cliente?.ciudad || 'Cali'}, {formatDate(pedido.fecha)}</Blue>
                      &ensp;<strong>Hora:</strong>&ensp;<Blue>{hora}</Blue>
                      &ensp;<strong>F. Entrega</strong>&ensp;<Blue>{formatDate(pedido.fechaEntregaEstimada)}</Blue>
                      &ensp;<strong>Orden Compra</strong>&ensp;
                      <span style={{ border: '1.5px solid #1e293b', padding: '1px 8px', borderRadius: '3px', background: '#f1f5f9', fontWeight: '700' }}>
                        <Blue>{pedido.facturaId || '–'}</Blue>
                      </span>
                    </td>
                  </tr>
                  <Irow>
                    <td style={{ ...ic, width: '62%', borderTop: sep, fontWeight: 'normal' }}>
                      <strong>Cliente</strong>&ensp;<Blue style={{ fontWeight: '700', fontSize: '11.5px' }}>{cliente?.razonSocial?.toUpperCase()}</Blue>
                    </td>
                    <td style={{ ...ic, borderTop: sep, borderLeft: sep }}>
                      <strong>NIT.</strong>&ensp;<Blue>{cliente?.nit}</Blue>
                    </td>
                  </Irow>
                  <Irow>
                    <td style={{ ...ic, borderTop: sep }}>
                      <strong>Dirección</strong>&ensp;<Blue>{cliente?.direccion}</Blue>
                    </td>
                    <td style={{ ...ic, borderTop: sep, borderLeft: sep }}>
                      <strong>Teléfono</strong>&ensp;<Blue>{cliente?.telefono}</Blue>
                    </td>
                  </Irow>
                  <Irow>
                    <td colSpan={2} style={{ ...ic, borderTop: sep }}>
                      <strong>Ciudad /</strong>&ensp;
                      <Blue>{cliente?.ciudad}{cliente?.departamento ? `, ${cliente.departamento}` : ''}</Blue>
                    </td>
                  </Irow>
                </tbody>
              </table>

              {/* ══ PROCESS CHECKBOXES ══ */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e293b', borderTop: 'none', fontSize: '8.5px', background: '#fafafa' }}>
                <tbody>
                  {PROCESOS_DEF.map((rowDef, ri) => (
                    <tr key={ri}>
                      {rowDef.groups.map((grp, gi) => {
                        const isLast = gi === rowDef.groups.length - 1;
                        return (
                          <td key={grp.key} style={{ padding: '6px 7px', borderRight: isLast ? 'none' : sep, borderTop: ri > 0 ? sep : 'none', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: '700', fontSize: '8px', letterSpacing: '0.3px', color: '#374151', marginBottom: '4px' }}>{grp.label}</div>
                            {grp.facturaField ? (
                              <div style={{ border: sep, padding: '2px 5px', minHeight: '16px', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', fontWeight: '600', borderRadius: '3px' }}>
                                {pedido.facturaId || ''}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {grp.checks.map((ck, ci) => (
                                  <label key={ck} className="proc-check">
                                    <input type="checkbox" checked={!!procesos[ck]} onChange={() => toggleProceso(ck)} />
                                    <span style={{ color: '#6b7280', fontSize: '7.5px' }}>{grp.checkLabels[ci]}</span>
                                  </label>
                                ))}
                                {grp.extra?.map(ex => (
                                  <label key={ex.key} className="proc-check" style={{ flexDirection: 'row', gap: '4px', width: '100%', marginTop: '3px', alignItems: 'center' }}>
                                    <input type="checkbox" checked={!!procesos[ex.key]} onChange={() => toggleProceso(ex.key)} />
                                    <span style={{ color: '#6b7280', fontSize: '7.5px' }}>{ex.label}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ══ ITEMS TABLE ══ */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e293b', borderTop: 'none', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(to bottom, #1e293b, #334155)', color: 'white' }}>
                    {['ITEM','COLOR','ESP. m.m.','CANT.','ANCHO x ALTO','D.T.','AREA','PER.','DES.','BOQ.'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                    <th colSpan={2} style={th}>BORDE (AxH)</th>
                    <th colSpan={2} style={th}>CHA (AxH)</th>
                    <th style={th}>C.C.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ item, op, esp, borde, cha, num }, ri) => (
                    <tr key={item.id} style={{ background: ri % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ ...td, color: '#1e293b', fontWeight: '700' }}>{num}</td>
                      <td style={td}>
                        <input type="text" value={op.color ?? ''} onChange={e => setOp(item.id, 'color', e.target.value)}
                          className="op-input from-product" style={{ width: '36px' }} />
                      </td>
                      <td style={{ ...td, color: '#1d4ed8', fontWeight: '700', background: '#eff6ff' }}>{esp || '–'}</td>
                      <td style={{ ...td, color: '#1d4ed8', fontWeight: '700', background: '#eff6ff' }}>{item.cantidad}</td>
                      <td style={{ ...td, color: '#1d4ed8', fontWeight: '600', background: '#eff6ff', textAlign: 'left', paddingLeft: '5px', whiteSpace: 'nowrap' }}>
                        {item.ancho && item.alto ? `${parseFloat(item.ancho).toFixed(3)} x ${parseFloat(item.alto).toFixed(3)}` : '–'}
                      </td>
                      <td style={td}>
                        <select value={op.dt} onChange={e => setOp(item.id, 'dt', e.target.value)} className="op-select" style={{ width: '44px' }}>
                          {DT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>
                      <td style={{ ...td, color: '#1d4ed8', fontWeight: '700', background: '#eff6ff' }}>
                        {item.area ? parseFloat(item.area).toFixed(2) : '–'}
                      </td>
                      <td style={td}><NI value={op.per} onChange={v => setOp(item.id, 'per', v)} /></td>
                      <td style={td}><NI value={op.des} onChange={v => setOp(item.id, 'des', v)} /></td>
                      <td style={td}><NI value={op.boq} onChange={v => setOp(item.id, 'boq', v)} /></td>
                      <td style={td}><NI value={op.borde_a} onChange={v => setOp(item.id, 'borde_a', v)} /></td>
                      <td style={td}><NI value={op.borde_h} onChange={v => setOp(item.id, 'borde_h', v)} /></td>
                      <td style={td}><NI value={op.cha_a} onChange={v => setOp(item.id, 'cha_a', v)} /></td>
                      <td style={td}><NI value={op.cha_h} onChange={v => setOp(item.id, 'cha_h', v)} /></td>
                      <td style={td}><NI value={op.cc} onChange={v => setOp(item.id, 'cc', v)} w={32} /></td>
                    </tr>
                  ))}

                  {/* Totals */}
                  <tr style={{ background: '#f1f5f9', fontWeight: '700', borderTop: '2px solid #1e293b' }}>
                    <td colSpan={3} style={{ ...td, textAlign: 'left', paddingLeft: '7px', fontSize: '10.5px' }}>
                      PESO:&ensp;<span style={{ color: '#1d4ed8' }}>{tot.peso}</span>&ensp;Kgs
                    </td>
                    <td style={{ ...td, color: '#1d4ed8' }}>{tot.cant}</td>
                    <td style={td}></td><td style={td}></td>
                    <td style={{ ...td, color: '#1d4ed8' }}>{tot.area}</td>
                    <td style={td}>{tot.per}</td>
                    <td style={td}>{tot.des}</td>
                    <td style={td}>{tot.boq}</td>
                    <td colSpan={2} style={td}>{tot.borde}</td>
                    <td colSpan={2} style={td}>{tot.cha}</td>
                    <td style={td}>{tot.cc}</td>
                  </tr>
                </tbody>
              </table>

              {/* ══ FOOTER ══ */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e293b', borderTop: 'none' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 12px', fontSize: '10px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', marginBottom: '4px', color: '#374151' }}>Observaciones:</div>
                      <div style={{ lineHeight: '1.6', textTransform: 'uppercase', fontWeight: '600', color: '#1e293b' }}>
                        {pedido.observacionesProduccion || ''}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 16px 18px', borderTop: '1px solid #e2e8f0', fontSize: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {['Responsable de producción', 'Revisado por', 'Autorizado por'].map((label, i) => (
                          <div key={i} style={{ textAlign: 'center', minWidth: '150px' }}>
                            <div style={{ borderTop: '1px solid #374151', marginTop: '32px', paddingTop: '4px', color: '#374151' }}>{label}</div>
                            {i === 0 && <div style={{ fontWeight: '700', marginTop: '2px', color: '#0f172a' }}>{pedido.responsable}</div>}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>{/* /print-doc */}
          </div>{/* /scroll wrapper */}
        </div>{/* /page padding */}
      </div>{/* /page shell */}
    </>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Blue({ children, style }) {
  return <span style={{ color: '#1d4ed8', fontWeight: '600', ...style }}>{children}</span>;
}
function NI({ value, onChange, w = 30 }) {
  return (
    <input type="number" min="0" value={value} onChange={e => onChange(e.target.value)}
      className="op-input user-input" style={{ width: `${w}px` }} />
  );
}

// ─── Row wrapper (avoids repeating <tr> JSX) ──────────────────────────────────
function Irow({ children }) { return <tr>{children}</tr>; }

// ─── Shared style tokens ──────────────────────────────────────────────────────
const sep = '1px solid #cbd5e1';
const ic  = { padding: '5px 8px', fontSize: '11px' };
const th  = { border: '1px solid rgba(255,255,255,0.2)', padding: '5px 3px', textAlign: 'center', fontSize: '9px', whiteSpace: 'nowrap', fontWeight: '600', letterSpacing: '0.3px' };
const td  = { border: sep, padding: '4px 2px', textAlign: 'center' };
