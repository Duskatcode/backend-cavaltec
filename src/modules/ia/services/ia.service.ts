import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ChatIaDto } from '../dto/explicar.dto';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class IaService {
  private readonly iaApiUrl = process.env.IA_SERVICE_URL || 'http://localhost:4000';

  constructor(private readonly prisma: PrismaService) {}

  async explicar(pregunta: string): Promise<string> {
    try {
      const { data } = await axios.post(`${this.iaApiUrl}/explicar`, { pregunta });
      return data.explicacion;
    } catch {
      throw new InternalServerErrorException('No se pudo obtener la explicación de IA');
    }
  }

  async chat(dto: ChatIaDto): Promise<{
    mensaje: string;
    finalizado: boolean;
    evaluacion_id: string | null;
    resultado?: any;
  }> {
    // 1. Cargar preguntas del back si no vienen en el payload
    let preguntas = dto.preguntas || [];
    if (preguntas.length === 0) {
      const preguntasDb = await this.prisma.pregunta.findMany({
        where: { activo: true },
        orderBy: { orden: 'asc' },
      });
      preguntas = preguntasDb.map((p) => ({
        id: p.id,
        categoria: p.categoria,
        texto: p.texto,
        peso: p.peso,
      }));
    }

    // 2. Llamar al ia-api microservicio
    try {
      const { data } = await axios.post(`${this.iaApiUrl}/chat`, {
        empresa_id: dto.empresa_id,
        empresa_nombre: dto.empresa_nombre,
        usuario_id: dto.usuario_id,
        historial: dto.historial || [],
        mensaje: dto.mensaje,
        preguntas,
      });

      // 3. Si finalizó y hay empresa+usuario, crear evaluación en BD
      if (data.finalizado && dto.empresa_id && dto.usuario_id && data.respuestas) {
        try {
          const evaluacion = await this.prisma.evaluacion.create({
            data: {
              empresa_id: dto.empresa_id,
              usuario_id: dto.usuario_id,
              estado: 'EN_PROGRESO',
            },
          });

          // Insertar respuestas
          for (const r of data.respuestas) {
            const pregunta = await this.prisma.pregunta.findUnique({
              where: { id: r.preguntaId },
            });
            if (pregunta) {
              await this.prisma.respuesta.create({
                data: {
                  evaluacion_id: evaluacion.id,
                  pregunta_id: r.preguntaId,
                  respuesta: r.respuesta,
                  puntaje: r.respuesta ? pregunta.peso : 0,
                },
              });
            }
          }

          // Calcular porcentaje via función de BD
          await this.prisma.$queryRaw`SELECT fn_calcular_porcentaje(${evaluacion.id}::uuid)`;

          return {
            mensaje: data.mensaje,
            finalizado: true,
            evaluacion_id: evaluacion.id,
          };
        } catch (e) {
          // Si falla guardar en BD, igual retorna el resultado del chat
          console.error('Error guardando evaluación:', e);
        }
      }

      return {
        mensaje: data.mensaje,
        finalizado: data.finalizado,
        evaluacion_id: data.evaluacion_id || null,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.response?.data?.message || 'No se pudo conectar con el servicio de IA',
      );
    }
  }
}
