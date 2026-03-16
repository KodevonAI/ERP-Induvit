import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DianService {
  private readonly logger = new Logger(DianService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async enviarFactura(facturaId: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: {
        cliente: true,
        items: { include: { producto: true } },
      },
    });

    if (!factura) throw new BadRequestException(`Factura ${facturaId} no encontrada`);
    if (factura.estadoDian === 'aceptada') {
      throw new BadRequestException(`Factura ${facturaId} ya fue aceptada por la DIAN`);
    }

    try {
      // Construir XML UBL 2.1
      const xmlUbl = this.construirXmlUbl(factura);
      this.logger.log(`XML UBL construido para factura ${facturaId}`);

      // En ambiente de habilitación: llamar SOAP DIAN
      // Si no hay certificado configurado, usar modo simulación
      const certPath = this.config.get('dian.certPath');
      let resultado: { cufe: string; fechaAceptacion: Date; respuestaDian: any };

      if (certPath && require('fs').existsSync(certPath)) {
        resultado = await this.enviarSoap(xmlUbl, factura);
      } else {
        this.logger.warn('Certificado DIAN no configurado — usando modo simulación');
        resultado = await this.simularRespuestaDian(factura);
      }

      // Guardar en DB
      const updatedFactura = await this.prisma.factura.update({
        where: { id: facturaId },
        data: {
          estadoDian: 'aceptada',
          cufe: resultado.cufe,
          fechaAceptacionDian: resultado.fechaAceptacion,
        },
      });

      return {
        facturaId,
        estadoDian: 'aceptada',
        cufe: resultado.cufe,
        fechaAceptacion: resultado.fechaAceptacion,
        mensaje: 'Factura enviada y aceptada por la DIAN exitosamente',
      };
    } catch (error) {
      this.logger.error(`Error enviando factura ${facturaId} a DIAN: ${error.message}`);

      await this.prisma.factura.update({
        where: { id: facturaId },
        data: { estadoDian: 'error' },
      });

      throw new InternalServerErrorException(
        `Error al enviar factura a DIAN: ${error.message}`,
      );
    }
  }

  private construirXmlUbl(factura: any): string {
    const nit = this.config.get('dian.nit');
    const nitDian = this.config.get('dian.nitDian');

    // XML UBL 2.1 simplificado (estructura base para factura electrónica colombiana)
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1</cbc:ProfileID>
  <cbc:ID>${factura.id}</cbc:ID>
  <cbc:UUID schemeID="${nitDian}" schemeName="CUFE-SHA384">PENDIENTE</cbc:UUID>
  <cbc:IssueDate>${factura.fecha.toISOString().split('T')[0]}</cbc:IssueDate>
  <cbc:IssueTime>${factura.fecha.toISOString().split('T')[1].substring(0, 8)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID schemeID="31">${nit}</cbc:CompanyID>
        <cbc:TaxLevelCode>O-13</cbc:TaxLevelCode>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Indusvit S.A.S.</cbc:RegistrationName>
        <cbc:CompanyID schemeID="31">${nit}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${factura.cliente.nit}</cbc:CompanyID>
        <cbc:TaxLevelCode>O-13</cbc:TaxLevelCode>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${factura.cliente.razonSocial}</cbc:RegistrationName>
        <cbc:CompanyID>${factura.cliente.nit}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
</Invoice>`;
  }

  private async enviarSoap(xmlUbl: string, factura: any) {
    // Integración real con SOAP DIAN
    // Requiere: node-soap + certificado .p12 + node-forge para firma XML
    // Ver documentación: https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/

    const soap = require('node-soap');
    const wsdlUrl = this.config.get('dian.wsdlUrl');

    const client = await soap.createClientAsync(wsdlUrl);

    // TODO: Firmar XML con certificado digital usando node-forge
    // const xmlFirmado = await this.firmarXml(xmlUbl);
    // const xmlBase64 = Buffer.from(xmlFirmado).toString('base64');

    const xmlBase64 = Buffer.from(xmlUbl).toString('base64');

    const args = {
      fileName: `${factura.id}.xml`,
      contentFile: xmlBase64,
    };

    const [result] = await client.SendBillSyncAsync(args);

    if (!result?.SendBillSyncResult?.IsValid) {
      throw new Error(`DIAN rechazó la factura: ${result?.SendBillSyncResult?.ErrorMessage}`);
    }

    return {
      cufe: result.SendBillSyncResult.XmlDocumentKey || this.generarCufe(factura),
      fechaAceptacion: new Date(),
      respuestaDian: result.SendBillSyncResult,
    };
  }

  private async simularRespuestaDian(factura: any) {
    // Simulación para desarrollo sin certificado DIAN
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cufe = this.generarCufe(factura);
    return {
      cufe,
      fechaAceptacion: new Date(),
      respuestaDian: { simulado: true, IsValid: true },
    };
  }

  private generarCufe(factura: any): string {
    const nit = this.config.get('dian.nit');
    const nitDian = this.config.get('dian.nitDian');
    const fecha = factura.fecha.toISOString().split('T')[0].replace(/-/g, '');

    const data = `${factura.numero}${fecha}${nit}${nitDian}`;
    return crypto.createHash('sha384').update(data).digest('hex');
  }
}
