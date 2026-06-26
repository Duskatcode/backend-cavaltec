import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class ResultadoService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResultados(evaluacionId: string) {
    // 1. Obtener los datos base de la evaluación
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      select: {
        id: true,
        porcentaje: true,
        nivel: true,
        estado: true,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    // 2. Consultar la vista v_brechas usando query nativo
    // Tipamos la respuesta esperada del query raw
    const brechasRaw = await this.prisma.$queryRaw<Array<{ texto: string }>>`
      SELECT texto FROM v_brechas 
      WHERE evaluacion_id = ${evaluacionId}::uuid
    `;

    // Extraemos solo el texto de las preguntas falladas
    const brechas = brechasRaw.map((b) => b.texto);

    // 3. Retornar con el contrato establecido
    return {
      message: 'Resultados obtenidos correctamente',
      data: {
        cumplimiento: Number(evaluacion.porcentaje), // Prisma retorna Decimal, lo parseamos a Number
        nivel: evaluacion.nivel,
        brechas: brechas,
      },
    };
  }
}