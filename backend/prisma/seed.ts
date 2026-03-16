import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ==========================================
  // USUARIOS
  // ==========================================
  const passwordHash = await bcrypt.hash('indusvit123', 12);

  await prisma.user.upsert({
    where: { username: 'indusvit.admin' },
    update: {},
    create: {
      username: 'indusvit.admin',
      passwordHash,
      nombre: 'Santiago Ramírez',
      cargo: 'Administrador del Sistema',
      email: 'admin@indusvit.com',
      telefono: '601 234 5678',
      role: 'ADMIN',
      empresa: 'Indusvit S.A.S.',
      nitEmpresa: '900.000.001-0',
      direccionEmpresa: 'Cra 7 # 45-23, Bogotá D.C.',
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'indusvit.ventas' },
    update: {},
    create: {
      username: 'indusvit.ventas',
      passwordHash,
      nombre: 'María Fernanda Ospina',
      cargo: 'Ejecutiva de Ventas',
      email: 'ventas@indusvit.com',
      telefono: '601 234 5679',
      role: 'VENTAS',
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'indusvit.produccion' },
    update: {},
    create: {
      username: 'indusvit.produccion',
      passwordHash,
      nombre: 'Javier Morales',
      cargo: 'Jefe de Producción',
      email: 'produccion@indusvit.com',
      telefono: '601 234 5680',
      role: 'PRODUCCION',
      activo: true,
    },
  });

  console.log('✅ Usuarios creados');

  // ==========================================
  // CLIENTES
  // ==========================================
  const clientes = [
    {
      id: 'C001',
      razonSocial: 'Constructora Andina S.A.S.',
      nit: '900.123.456-7',
      email: 'compras@constructoraandina.com',
      telefono: '601 234 5678',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      direccion: 'Cra 15 # 93-47 Of. 501',
      contacto: 'Carlos Mendoza',
      regimen: 'Responsable de IVA',
    },
    {
      id: 'C002',
      razonSocial: 'Vidriera del Norte Ltda.',
      nit: '800.987.654-3',
      email: 'gerencia@vidrieranorte.com',
      telefono: '604 321 8765',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      direccion: 'Cll 50 # 46-30 Piso 2',
      contacto: 'Andrea López',
      regimen: 'Responsable de IVA',
    },
    {
      id: 'C003',
      razonSocial: 'Proyectos Arquitectónicos del Valle S.A.',
      nit: '805.456.789-1',
      email: 'licitaciones@provalle.com.co',
      telefono: '602 456 7890',
      ciudad: 'Cali',
      departamento: 'Valle del Cauca',
      direccion: 'Av. 6N # 25-32',
      contacto: 'Luis Fernando Castillo',
      regimen: 'Responsable de IVA',
    },
    {
      id: 'C004',
      razonSocial: 'Decoraciones Modernas del Caribe S.A.S.',
      nit: '900.654.321-9',
      email: 'pedidos@decomoderna.co',
      telefono: '605 789 0123',
      ciudad: 'Barranquilla',
      departamento: 'Atlántico',
      direccion: 'Cra 46 # 72-135 L-8',
      contacto: 'Patricia Herrera',
      regimen: 'No responsable de IVA',
    },
    {
      id: 'C005',
      razonSocial: 'Inmobiliaria Torres del Parque S.A.',
      nit: '860.123.789-4',
      email: 'obras@torresdelparque.com',
      telefono: '601 890 2345',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      direccion: 'Cll 85 # 11-54 Of. 1201',
      contacto: 'Hernando Torres',
      regimen: 'Responsable de IVA',
    },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { id: cliente.id },
      update: {},
      create: cliente,
    });
  }

  console.log('✅ Clientes creados');

  // ==========================================
  // PRODUCTOS
  // ==========================================
  const productos = [
    { id: 'P001', codigo: 'VT-4', nombre: 'Vidrio Templado 4mm', descripcion: 'Vidrio templado de seguridad, espesor 4mm. Ideal para mamparas y ventanas.', categoria: 'Vidrio Templado', color: 'INC', espesor: '4', unidad: 'm2', precioM2: 85000, precioPieza: 0, iva: 19, stock: 250 },
    { id: 'P002', codigo: 'VT-6', nombre: 'Vidrio Templado 6mm', descripcion: 'Vidrio templado de seguridad, espesor 6mm. Para divisiones y fachadas.', categoria: 'Vidrio Templado', color: 'INC', espesor: '6', unidad: 'm2', precioM2: 125000, precioPieza: 0, iva: 19, stock: 180 },
    { id: 'P003', codigo: 'VT-8', nombre: 'Vidrio Templado 8mm', descripcion: 'Vidrio templado de seguridad, espesor 8mm. Barandas y escaleras.', categoria: 'Vidrio Templado', color: 'INC', espesor: '8', unidad: 'm2', precioM2: 165000, precioPieza: 0, iva: 19, stock: 120 },
    { id: 'P004', codigo: 'VT-10', nombre: 'Vidrio Templado 10mm', descripcion: 'Vidrio templado de alta resistencia, espesor 10mm.', categoria: 'Vidrio Templado', color: 'INC', espesor: '10', unidad: 'm2', precioM2: 220000, precioPieza: 0, iva: 19, stock: 80 },
    { id: 'P005', codigo: 'VL-44', nombre: 'Vidrio Laminado 4+4mm', descripcion: 'Vidrio laminado de seguridad 4+4mm con film PVB. Techos y claraboyas.', categoria: 'Vidrio Laminado', color: 'INC', espesor: '8', unidad: 'm2', precioM2: 195000, precioPieza: 0, iva: 19, stock: 95 },
    { id: 'P006', codigo: 'VL-66', nombre: 'Vidrio Laminado 6+6mm', descripcion: 'Vidrio laminado de seguridad 6+6mm con film PVB.', categoria: 'Vidrio Laminado', color: 'INC', espesor: '12', unidad: 'm2', precioM2: 285000, precioPieza: 0, iva: 19, stock: 60 },
    { id: 'P007', codigo: 'VR-6B', nombre: 'Vidrio Reflectivo Bronce 6mm', descripcion: 'Vidrio reflectivo color bronce, espesor 6mm.', categoria: 'Vidrio Reflectivo', color: 'BRO', espesor: '6', unidad: 'm2', precioM2: 148000, precioPieza: 0, iva: 19, stock: 75 },
    { id: 'P008', codigo: 'VR-6G', nombre: 'Vidrio Reflectivo Gris 6mm', descripcion: 'Vidrio reflectivo color gris, espesor 6mm.', categoria: 'Vidrio Reflectivo', color: 'GRI', espesor: '6', unidad: 'm2', precioM2: 148000, precioPieza: 0, iva: 19, stock: 90 },
    { id: 'P009', codigo: 'VF-4', nombre: 'Vidrio Float Transparente 4mm', descripcion: 'Vidrio float transparente estándar 4mm.', categoria: 'Vidrio Float', color: 'INC', espesor: '4', unidad: 'm2', precioM2: 42000, precioPieza: 0, iva: 19, stock: 400 },
    { id: 'P010', codigo: 'VF-6', nombre: 'Vidrio Float Transparente 6mm', descripcion: 'Vidrio float transparente estándar 6mm.', categoria: 'Vidrio Float', color: 'INC', espesor: '6', unidad: 'm2', precioM2: 58000, precioPieza: 0, iva: 19, stock: 310 },
    { id: 'P011', codigo: 'VE-4', nombre: 'Vidrio Esmerilado 4mm', descripcion: 'Vidrio esmerilado opaco por un lado, espesor 4mm.', categoria: 'Vidrio Decorativo', color: 'ESM', espesor: '4', unidad: 'm2', precioM2: 72000, precioPieza: 0, iva: 19, stock: 130 },
    { id: 'P012', codigo: 'VS-TP', nombre: 'Sistema de Ducha Templado Premium', descripcion: 'Kit mampara de ducha en vidrio templado 8mm con herrajes en acero inoxidable.', categoria: 'Sistemas', color: 'INC', espesor: '8', unidad: 'unidad', precioM2: 0, precioPieza: 1850000, iva: 19, stock: 20 },
    { id: 'P013', codigo: 'VS-VV', nombre: 'Ventana de Vidrio Doble', descripcion: 'Ventana termopanel con cámara de aire 12mm, vidrio 4mm+4mm.', categoria: 'Sistemas', color: 'INC', espesor: '20', unidad: 'm2', precioM2: 320000, precioPieza: 0, iva: 19, stock: 45 },
    { id: 'P014', codigo: 'SV-COR', nombre: 'Servicio de Corte y Biselado', descripcion: 'Servicio de corte a medida y biselado de bordes.', categoria: 'Servicios', color: null, espesor: null, unidad: 'ml', precioM2: 0, precioPieza: 25000, iva: 19, stock: 0 },
    { id: 'P015', codigo: 'SV-INS', nombre: 'Servicio de Instalación', descripcion: 'Servicio de instalación y montaje de vidrios en obra.', categoria: 'Servicios', color: null, espesor: null, unidad: 'hora', precioM2: 0, precioPieza: 85000, iva: 19, stock: 0 },
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { id: producto.id },
      update: {},
      create: producto,
    });
  }

  console.log('✅ Productos creados');

  // ==========================================
  // COTIZACION DEMO
  // ==========================================
  const cotizacionExiste = await prisma.cotizacion.findFirst({ where: { id: 'COT-2025-001' } });
  if (!cotizacionExiste) {
    await prisma.cotizacion.create({
      data: {
        id: 'COT-2025-001',
        fecha: new Date('2025-03-01'),
        vigencia: new Date('2025-04-01'),
        clienteId: 'C001',
        vendedor: 'Santiago Ramírez',
        estado: 'aprobada',
        condicionesPago: '30 días',
        plazoEntrega: '15 días hábiles',
        observaciones: 'Cotización para proyecto de fachada Edificio Central',
        descuento: 5,
        items: {
          create: [
            {
              productoId: 'P002',
              descripcion: 'Vidrio Templado 6mm — Fachada principal',
              ancho: 1.5,
              alto: 2.4,
              area: 3.6,
              cantidad: 20,
              unidad: 'm2',
              precioUnitario: 125000,
              descuento: 5,
              iva: 19,
              orden: 1,
            },
            {
              productoId: 'P007',
              descripcion: 'Vidrio Reflectivo Bronce 6mm — Ventanas laterales',
              ancho: 1.2,
              alto: 1.8,
              area: 2.16,
              cantidad: 10,
              unidad: 'm2',
              precioUnitario: 148000,
              descuento: 5,
              iva: 19,
              orden: 2,
            },
          ],
        },
      },
    });
    console.log('✅ Cotización demo creada');
  }

  // ==========================================
  // FACTURA DEMO
  // ==========================================
  const facturaExiste = await prisma.factura.findFirst({ where: { id: 'FAC-2025-001' } });
  if (!facturaExiste) {
    await prisma.factura.create({
      data: {
        id: 'FAC-2025-001',
        numero: 1,
        fecha: new Date('2025-03-10'),
        fechaVencimiento: new Date('2025-04-10'),
        clienteId: 'C001',
        cotizacionId: 'COT-2025-001',
        vendedor: 'Santiago Ramírez',
        condicionesPago: '30 días',
        observaciones: 'Factura proyecto fachada Edificio Central',
        estadoDian: 'pendiente',
        items: {
          create: [
            {
              productoId: 'P002',
              descripcion: 'Vidrio Templado 6mm — Fachada principal',
              ancho: 1.5,
              alto: 2.4,
              area: 3.6,
              cantidad: 20,
              unidad: 'm2',
              precioUnitario: 125000,
              descuento: 5,
              iva: 19,
              orden: 1,
            },
          ],
        },
      },
    });
    console.log('✅ Factura demo creada');
  }

  // ==========================================
  // PEDIDO DEMO
  // ==========================================
  const pedidoExiste = await prisma.pedido.findFirst({ where: { id: 'PF-2025-001' } });
  if (!pedidoExiste) {
    await prisma.pedido.create({
      data: {
        id: 'PF-2025-001',
        numero: 1,
        fecha: new Date('2025-03-12'),
        fechaEntregaEstimada: new Date('2025-03-27'),
        facturaId: 'FAC-2025-001',
        clienteId: 'C001',
        estado: 'en_proceso',
        responsable: 'Javier Morales',
        observacionesProduccion: 'Prioridad alta. Medidas exactas adjuntas.',
        procesos: { etapas: ['corte', 'templado', 'despacho'] },
        items: {
          create: [
            {
              productoId: 'P002',
              descripcion: 'Vidrio Templado 6mm — Lote A',
              cantidad: 10,
              unidad: 'm2',
              ancho: 1.5,
              alto: 2.4,
              area: 3.6,
              precioUnitario: 125000,
              iva: 19,
              estadoItem: 'en_proceso',
              notasTecnicas: 'Canteado fino en todos los bordes',
              etapas: {
                create: [
                  { etapa: 'corte', completado: true, fechaFin: new Date('2025-03-14') },
                  { etapa: 'templado', completado: false },
                  { etapa: 'despacho', completado: false },
                ],
              },
            },
          ],
        },
      },
    });
    console.log('✅ Pedido demo creado');
  }

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
