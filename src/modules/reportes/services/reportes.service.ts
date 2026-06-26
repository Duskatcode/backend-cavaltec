import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async generarPdf(evaluacionId: string): Promise<Buffer> {
    // 1. Buscar en caché
    const reporteExistente = await this.prisma.reporte.findUnique({
      where: { evaluacion_id: evaluacionId },
    });

    if (reporteExistente) {
      console.log('📄 PDF obtenido desde caché');
      return Buffer.from(reporteExistente.pdf_data);
    }

    // 2. Obtener datos de la evaluación
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        empresa: true,
        respuestas: {
          include: { pregunta: true },
        },
      },
    });

    if (!evaluacion) {
      throw new Error('Evaluación no encontrada');
    }

    console.log('⚙️ Generando PDF nuevo...');

    // 3. Generar PDF y guardar
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', (b) => buffers.push(b));

      doc.on('end', async () => {
        try {
          const pdf = Buffer.concat(buffers);

          // Guardar (o actualizar) en tabla reportes
          await this.prisma.reporte.upsert({
            where: { evaluacion_id: evaluacion.id },
            update: {
              pdf_data: pdf,
              nombre_archivo: `reporte-${evaluacion.id}.pdf`,
              tamano_bytes: pdf.length,
              generado_en: new Date(),
            },
            create: {
              empresa_id: evaluacion.empresa_id,
              evaluacion_id: evaluacion.id,
              pdf_data: pdf,
              nombre_archivo: `reporte-${evaluacion.id}.pdf`,
              tamano_bytes: pdf.length,
            },
          });

          console.log('✅ PDF guardado en BD');
          resolve(pdf);
        } catch (error) {
          console.error('❌ Error al guardar PDF:', error);
          // Aun así devolvemos el PDF (no bloqueamos la respuesta)
          resolve(Buffer.concat(buffers));
        }
      });

      // Contenido del PDF
      doc.fontSize(22).text('Reporte de Evaluación');
      doc.moveDown();
      doc.fontSize(15).text(`Empresa: ${evaluacion.empresa.nombre}`);
      doc.text(`Nivel: ${evaluacion.nivel ?? 'Sin calcular'}`);
      doc.text(`Porcentaje: ${evaluacion.porcentaje ?? 0}%`);
      doc.text(`Respuestas: ${evaluacion.respuestas.length}`);
      doc.moveDown();
      doc.fontSize(18).text('Detalle');
      doc.moveDown(0.5);

      evaluacion.respuestas.forEach((r, i) => {
        doc.fontSize(12).text(`${i + 1}. ${r.pregunta.texto}`);
        doc.text(`Respuesta: ${r.respuesta ? 'Sí' : 'No'}`);
        doc.text(`Puntaje: ${r.puntaje}`);
        doc.moveDown();
      });

      doc.end();
    });
  }
}
