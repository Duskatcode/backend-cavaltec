import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async generarPdf(evaluacionId: string): Promise<Buffer> {
    const reporteExistente = await this.prisma.reporte.findUnique({
      where: { evaluacion_id: evaluacionId },
    });

    if (reporteExistente) {
      return Buffer.from(reporteExistente.pdf_data);
    }

    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        empresa: true,
        respuestas: {
          include: { pregunta: true },
          orderBy: { pregunta: { orden: 'asc' } },
        },
      },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada');

    const brechas = evaluacion.respuestas.filter((r) => !r.respuesta);
    const logros = evaluacion.respuestas.filter((r) => r.respuesta);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (b) => buffers.push(b));
      doc.on('error', reject);
      doc.on('end', async () => {
        const pdf = Buffer.concat(buffers);
        try {
          await this.prisma.reporte.upsert({
            where: { evaluacion_id: evaluacion.id },
            update: {
              pdf_data: pdf,
              nombre_archivo: `reporte-cavaltec-${evaluacion.id}.pdf`,
              tamano_bytes: pdf.length,
              generado_en: new Date(),
            },
            create: {
              empresa_id: evaluacion.empresa_id,
              evaluacion_id: evaluacion.id,
              pdf_data: pdf,
              nombre_archivo: `reporte-cavaltec-${evaluacion.id}.pdf`,
              tamano_bytes: pdf.length,
            },
          });
        } catch (e) {
          console.error('Error guardando PDF en BD:', e);
        }
        resolve(pdf);
      });

      const porcentaje = Number(evaluacion.porcentaje ?? 0);
      const nivel = evaluacion.nivel ?? 'Sin calcular';
      const colorNivel =
        nivel === 'EXCELENTE' ? '#16a34a' :
        nivel === 'BUENO'     ? '#2563eb' :
        nivel === 'BASICO'    ? '#d97706' : '#dc2626';

      // ── ENCABEZADO ────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 90).fill('#1a3a8f');
      doc.fillColor('#ffffff')
        .fontSize(24).font('Helvetica-Bold')
        .text('CAVALTEC', 50, 25);
      doc.fontSize(11).font('Helvetica')
        .text('Diagnóstico de Cumplimiento — Ley 1581 de 2012', 50, 54);
      doc.fillColor('#000000');

      // ── DATOS DE LA EVALUACIÓN ────────────────────────────
      doc.moveDown(3);
      doc.fontSize(18).font('Helvetica-Bold')
        .fillColor('#1a3a8f')
        .text('Informe de Evaluación', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica').fillColor('#374151');
      doc.text(`Empresa:       ${evaluacion.empresa.nombre}`);
      doc.text(`NIT:           ${evaluacion.empresa.nit}`);
      doc.text(`Sector:        ${evaluacion.empresa.sector}`);
      doc.text(`Fecha inicio:  ${evaluacion.fecha_inicio?.toLocaleDateString('es-CO') ?? '—'}`);
      doc.text(`Fecha fin:     ${evaluacion.fecha_fin?.toLocaleDateString('es-CO') ?? '—'}`);
      doc.moveDown();

      // ── RESULTADO PRINCIPAL ───────────────────────────────
      doc.rect(50, doc.y, doc.page.width - 100, 60).fill('#f8fafc').stroke('#e2e8f0');
      const rectY = doc.y - 60;
      doc.fillColor(colorNivel).fontSize(36).font('Helvetica-Bold')
        .text(`${porcentaje}%`, 70, rectY + 10, { width: 100, align: 'center' });
      doc.fillColor('#1f2937').fontSize(16).font('Helvetica-Bold')
        .text(`Nivel: ${nivel}`, 190, rectY + 20);
      doc.fillColor('#000000');
      doc.moveDown(2);

      // ── BRECHAS ───────────────────────────────────────────
      if (brechas.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626')
          .text(`Brechas identificadas (${brechas.length})`);
        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#dc2626');
        doc.moveDown(0.5);

        brechas.forEach((r, i) => {
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#1f2937')
            .text(`${i + 1}. [${r.pregunta.categoria}]`);
          doc.fontSize(10).font('Helvetica').fillColor('#374151')
            .text(`   ${r.pregunta.texto}`);
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }

      // ── LOGROS ────────────────────────────────────────────
      if (logros.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a')
          .text(`Aspectos cumplidos (${logros.length})`);
        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#16a34a');
        doc.moveDown(0.5);

        logros.forEach((r, i) => {
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#1f2937')
            .text(`${i + 1}. [${r.pregunta.categoria}]`);
          doc.fontSize(10).font('Helvetica').fillColor('#374151')
            .text(`   ${r.pregunta.texto}`);
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }

      // ── RECOMENDACIONES ───────────────────────────────────
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a3a8f')
        .text('Recomendaciones prioritarias');
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#1a3a8f');
      doc.moveDown(0.5);

      const recomendaciones = [
        { nivel: 'CRITICO', texto: 'Implementar inmediatamente una Política de Tratamiento de Datos Personales y publicarla.' },
        { nivel: 'BASICO', texto: 'Establecer canales formales para ejercicio de derechos ARCO de los titulares.' },
        { nivel: 'BUENO', texto: 'Fortalecer medidas técnicas de seguridad y realizar auditorías periódicas.' },
        { nivel: 'EXCELENTE', texto: 'Mantener el nivel actual y prepararse para certificaciones internacionales.' },
      ];

      const rec = recomendaciones.find((r) => r.nivel === nivel) || recomendaciones[0];
      doc.fontSize(11).font('Helvetica').fillColor('#374151').text(`• ${rec.texto}`);
      doc.moveDown();

      if (brechas.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1f2937')
          .text('Acciones inmediatas por brecha:');
        doc.moveDown(0.3);
        brechas.slice(0, 5).forEach((r) => {
          doc.fontSize(10).font('Helvetica').fillColor('#374151')
            .text(`• ${r.pregunta.categoria}: revisar y documentar cumplimiento.`);
        });
      }

      // ── PIE DE PÁGINA ─────────────────────────────────────
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
        .text(
          `Reporte generado por CAVALTEC — ${new Date().toLocaleDateString('es-CO')} — Ley 1581 de 2012`,
          { align: 'center' }
        );

      doc.end();
    });
  }
}
