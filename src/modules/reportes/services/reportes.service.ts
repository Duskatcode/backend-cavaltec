import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generarPdf(evaluacionId: string): Promise<Buffer> {

    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        empresa: true,
        respuestas: {
          include: {
            pregunta: true,
          },
        },
      },
    });

    if (!evaluacion) {
      throw new Error('Evaluación no encontrada');
    }

    return new Promise((resolve) => {

      const doc = new PDFDocument();

      const buffers: Buffer[] = [];

      doc.on('data', (b) => buffers.push(b));

      doc.on('end', () => resolve(Buffer.concat(buffers)));

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

        doc.fontSize(12).text(
          `${i + 1}. ${r.pregunta.texto}`
        );

        doc.text(
          `Respuesta: ${r.respuesta ? 'Sí' : 'No'}`
        );

        doc.text(
          `Puntaje: ${r.puntaje}`
        );

        doc.moveDown();
      });

      doc.end();

    });

  }

}
