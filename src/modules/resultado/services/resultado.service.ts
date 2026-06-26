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
        porcentaje: true,
        nivel: true,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    // 2. Consultar la vista v_brechas usando el nombre de columna correcto: 'pregunta'
    // Según Screenshot 2026-06-26 at 3.21.38 PM.png, la columna se llama 'pregunta'
    const brechasRaw = await this.prisma.$queryRaw<Array<{ pregunta: string }>>`
      SELECT pregunta FROM v_brechas 
      WHERE evaluacion_id = ${evaluacionId}::uuid
    `;

    // 3. Retornar con el contrato establecido
    return {
      cumplimiento: Number(evaluacion.porcentaje),
      nivel: evaluacion.nivel,
      // Mapeamos usando 'pregunta' en lugar de 'texto'
      brechas: brechasRaw.map((b) => b.pregunta),
    };
  }
}