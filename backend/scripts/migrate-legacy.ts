/**
 * migrate-legacy.ts — ETL para migrar datos desde app de escritorio legacy
 *
 * Uso:
 *   ts-node scripts/migrate-legacy.ts --input ./legacy-export.json
 *   ts-node scripts/migrate-legacy.ts --input ./clientes.csv --type clientes
 *
 * Formatos soportados: JSON | CSV
 * Tipos de datos: clientes | productos | cotizaciones | facturas | pedidos
 *
 * El mapeo exacto de campos se define cuando se conozca el formato del sistema antiguo.
 * Por ahora incluye validación, normalización y lógica de deduplicación.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

// ==========================================
// CLI ARGS
// ==========================================
const args = process.argv.slice(2);
const getArg = (name: string) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const inputFile = getArg('input');
const dataType = getArg('type') || 'auto'; // auto | clientes | productos | etc.
const dryRun = args.includes('--dry-run');

if (!inputFile) {
  console.error('❌ Uso: ts-node migrate-legacy.ts --input <archivo> [--type <tipo>] [--dry-run]');
  process.exit(1);
}

// ==========================================
// UTILIDADES
// ==========================================
function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
  });
}

function parseInput(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return JSON.parse(content);
  if (ext === '.csv') return parseCsv(content);
  throw new Error(`Formato no soportado: ${ext}. Use .json o .csv`);
}

function detectType(data: any[]): string {
  if (!data.length) return 'unknown';
  const keys = Object.keys(data[0]).map((k) => k.toLowerCase());
  if (keys.some((k) => k.includes('razonsocial') || k.includes('nit'))) return 'clientes';
  if (keys.some((k) => k.includes('codigo') || k.includes('precio'))) return 'productos';
  if (keys.some((k) => k.includes('cotizacion'))) return 'cotizaciones';
  if (keys.some((k) => k.includes('factura'))) return 'facturas';
  if (keys.some((k) => k.includes('pedido'))) return 'pedidos';
  return 'unknown';
}

function normalizarNit(nit: string): string {
  return nit?.toString().replace(/\s/g, '').replace(/[.,]/g, '.') || '';
}

function nextId(prefix: string, seq: number): string {
  return `${prefix}${seq.toString().padStart(3, '0')}`;
}

// ==========================================
// MAPEOS POR TIPO
// ==========================================

// Mapeo clientes: adaptable al schema del sistema antiguo
// Ajustar los nombres de campo según el export real
function mapearCliente(raw: any, idx: number): any {
  return {
    // El ID se genera si no viene del sistema antiguo
    id: raw.id || raw.ID || raw.codigo_cliente || nextId('C', idx + 100),
    razonSocial: raw.razon_social || raw.razonSocial || raw.nombre_empresa || raw.nombre || '',
    nit: normalizarNit(raw.nit || raw.NIT || raw.rut || ''),
    email: raw.email || raw.correo || raw.email_contacto || null,
    telefono: raw.telefono || raw.tel || raw.phone || null,
    ciudad: raw.ciudad || raw.city || null,
    departamento: raw.departamento || raw.depto || null,
    direccion: raw.direccion || raw.address || null,
    contacto: raw.contacto || raw.nombre_contacto || raw.contact || null,
    regimen: raw.regimen || raw.tipo_contribuyente || 'Responsable de IVA',
    activo: raw.activo !== false && raw.activo !== '0' && raw.estado !== 'inactivo',
  };
}

function mapearProducto(raw: any, idx: number): any {
  return {
    id: raw.id || raw.ID || raw.codigo || nextId('P', idx + 100),
    codigo: raw.codigo || raw.sku || raw.ref || `LEGACY-${idx}`,
    nombre: raw.nombre || raw.name || raw.descripcion_corta || '',
    descripcion: raw.descripcion || raw.description || null,
    categoria: raw.categoria || raw.category || raw.tipo || null,
    color: raw.color || null,
    espesor: raw.espesor?.toString() || raw.grosor?.toString() || null,
    unidad: raw.unidad || raw.unit || 'm2',
    precioM2: parseFloat(raw.precio_m2 || raw.precioM2 || raw.precio || '0') || 0,
    precioPieza: parseFloat(raw.precio_pieza || raw.precioPieza || '0') || 0,
    iva: parseInt(raw.iva || '19') || 19,
    stock: parseFloat(raw.stock || raw.cantidad || '0') || 0,
    activo: raw.activo !== false && raw.activo !== '0',
  };
}

// ==========================================
// VALIDADORES
// ==========================================
function validarCliente(cliente: any, errores: string[]): boolean {
  if (!cliente.razonSocial) errores.push(`Cliente ${cliente.id}: falta razonSocial`);
  if (!cliente.nit) errores.push(`Cliente ${cliente.id}: falta NIT`);
  return !errores.length || errores[errores.length - 1].startsWith(`Cliente ${cliente.id}`) === false;
}

function validarProducto(producto: any, errores: string[]): boolean {
  if (!producto.nombre) errores.push(`Producto ${producto.id}: falta nombre`);
  if (!producto.codigo) errores.push(`Producto ${producto.id}: falta código`);
  return true;
}

// ==========================================
// IMPORTADORES
// ==========================================
async function importarClientes(data: any[]) {
  console.log(`\n📋 Importando ${data.length} clientes...`);
  let ok = 0, skip = 0;
  const errores: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const cliente = mapearCliente(data[i], i);
    validarCliente(cliente, errores);

    if (!cliente.nit) { skip++; continue; }

    // Verificar duplicados por NIT
    const existe = await prisma.cliente.findUnique({ where: { nit: cliente.nit } });
    if (existe) {
      console.log(`  ⏭  Saltando ${cliente.id} — NIT ${cliente.nit} ya existe (${existe.razonSocial})`);
      skip++;
      continue;
    }

    if (!dryRun) {
      await prisma.cliente.create({ data: cliente });
    } else {
      console.log(`  [DRY-RUN] Crearía: ${cliente.razonSocial} (${cliente.nit})`);
    }
    ok++;
  }

  return { ok, skip, errores };
}

async function importarProductos(data: any[]) {
  console.log(`\n📦 Importando ${data.length} productos...`);
  let ok = 0, skip = 0;
  const errores: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const producto = mapearProducto(data[i], i);
    validarProducto(producto, errores);

    // Verificar duplicados por código
    const existe = await prisma.producto.findUnique({ where: { codigo: producto.codigo } });
    if (existe) {
      console.log(`  ⏭  Saltando ${producto.codigo} — ya existe`);
      skip++;
      continue;
    }

    if (!dryRun) {
      await prisma.producto.create({ data: producto });
    } else {
      console.log(`  [DRY-RUN] Crearía: ${producto.nombre} (${producto.codigo})`);
    }
    ok++;
  }

  return { ok, skip, errores };
}

// ==========================================
// MAIN
// ==========================================
async function main() {
  console.log('🚀 ERP Indusvit — Migración de datos legacy');
  console.log(`📂 Archivo: ${inputFile}`);
  if (dryRun) console.log('⚠️  Modo DRY-RUN — no se escribirá en la base de datos\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Archivo no encontrado: ${inputFile}`);
    process.exit(1);
  }

  const data = parseInput(inputFile);
  console.log(`✅ ${data.length} registros leídos del archivo`);

  const tipo = dataType === 'auto' ? detectType(data) : dataType;
  console.log(`🔍 Tipo detectado: ${tipo}`);

  let resultado: any;

  switch (tipo) {
    case 'clientes':
      resultado = await importarClientes(data);
      break;
    case 'productos':
      resultado = await importarProductos(data);
      break;
    default:
      console.error(`❌ Tipo de datos no implementado aún: "${tipo}"`);
      console.log('💡 Tipos disponibles: clientes, productos');
      console.log('💡 Para cotizaciones, facturas y pedidos: definir mapeo con el formato exacto del sistema legacy');
      process.exit(1);
  }

  console.log('\n==========================================');
  console.log('📊 Resultado de la migración:');
  console.log(`  ✅ Importados: ${resultado.ok}`);
  console.log(`  ⏭  Saltados (duplicados): ${resultado.skip}`);
  if (resultado.errores.length) {
    console.log(`  ⚠️  Advertencias (${resultado.errores.length}):`);
    resultado.errores.forEach((e: string) => console.log(`    - ${e}`));
  }
  console.log('==========================================');

  if (dryRun) {
    console.log('\n⚠️  DRY-RUN completado — ningún dato fue guardado');
    console.log('   Para ejecutar la migración real, quita el flag --dry-run');
  } else {
    console.log('\n🎉 Migración completada exitosamente');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
