import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const [
      cotizacionesActivas,
      cotizacionesMes,
      facturas,
      facturasAceptadas,
      pedidosEnProceso,
      itemsEnFabricacion,
      clientes,
      productos,
    ] = await Promise.all([
      // Cotizaciones activas (borrador + enviada + aprobada)
      this.prisma.cotizacion.count({
        where: { estado: { in: ['borrador', 'enviada', 'aprobada'] } },
      }),
      // Cotizaciones del mes actual
      this.prisma.cotizacion.count({
        where: {
          fecha: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // Total facturas
      this.prisma.factura.findMany({
        include: { items: true },
      }),
      // Facturas aceptadas por DIAN
      this.prisma.factura.count({ where: { estadoDian: 'aceptada' } }),
      // Pedidos en proceso
      this.prisma.pedido.count({ where: { estado: 'en_proceso' } }),
      // Items en fabricación
      this.prisma.pedidoItem.count({ where: { estadoItem: 'en_proceso' } }),
      // Clientes activos
      this.prisma.cliente.count({ where: { activo: true } }),
      // Productos activos
      this.prisma.producto.count({ where: { activo: true } }),
    ]);

    // Calcular total facturado
    const totalFacturado = facturas.reduce((acc, factura) => {
      const subtotal = factura.items.reduce((s, item) => {
        const base = item.precioUnitario * item.cantidad * (1 - item.descuento / 100);
        const conIva = base * (1 + item.iva / 100);
        return s + conIva;
      }, 0);
      return acc + subtotal;
    }, 0);

    // Calcular total facturado mes actual
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const facturasMes = facturas.filter((f) => f.fecha >= inicioMes);
    const totalFacturadoMes = facturasMes.reduce((acc, factura) => {
      const subtotal = factura.items.reduce((s, item) => {
        const base = item.precioUnitario * item.cantidad * (1 - item.descuento / 100);
        const conIva = base * (1 + item.iva / 100);
        return s + conIva;
      }, 0);
      return acc + subtotal;
    }, 0);

    // Últimas cotizaciones
    const ultimasCotizaciones = await this.prisma.cotizacion.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { cliente: { select: { razonSocial: true } } },
    });

    // Últimos pedidos
    const ultimosPedidos = await this.prisma.pedido.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { cliente: { select: { razonSocial: true } } },
    });

    return {
      kpis: {
        cotizacionesActivas,
        cotizacionesMes,
        totalFacturado,
        totalFacturadoMes,
        facturasTotal: facturas.length,
        facturasAceptadas,
        pedidosEnProceso,
        itemsEnFabricacion,
        clientes,
        productos,
      },
      ultimasCotizaciones,
      ultimosPedidos,
    };
  }
}
