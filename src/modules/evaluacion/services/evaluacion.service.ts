import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';

@Injectable()
export class EvaluacionService {
  constructor(private readonly prisma: PrismaService) {}

  async crearEvaluacion(dto: CreateEvaluacionDto) {
    const { empresaId, usuarioId, respuestas } = dto;

    // 1. Validar existencia de Empresa
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });
    if (!empresa || empresa.estado !== 'ACTIVO') {
      throw new NotFoundException('Empresa no encontrada o inactiva');
    }

    // 2. Validar Usuario y que pertenezca a la empresa
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    // Nota: verifica si Prisma mapeó tu columna empresa_id como empresaId o empresa_id
    if (usuario.empresa_id !== empresaId) {
      throw new BadRequestException('El usuario no pertenece a la empresa indicada');
    }

    // 3. Traer preguntas activas para conocer sus pesos
    const preguntas = await this.prisma.pregunta.findMany({
      where: { activo: true },
    });

    if (preguntas.length === 0) {
      throw new BadRequestException('No hay preguntas activas en el sistema');
    }

    const mapaPreguntas = new Map(preguntas.map((p) => [p.id, p.peso]));

    // 4. Crear Evaluación y Respuestas en una Transacción
    const evaluacion = await this.prisma.$transaction(async (tx) => {
      // a. Crear la evaluación en progreso
      const nuevaEval = await tx.evaluacion.create({
        data: {
          empresa_id: empresaId,
          usuario_id: usuarioId,
          estado: 'EN_PROGRESO',
        },
      });

      // b. Preparar la data de respuestas calculando los puntajes
      const respuestasData = respuestas.map((r) => {
        const peso = mapaPreguntas.get(r.preguntaId);
        if (!peso) {
          throw new BadRequestException(`La pregunta con ID ${r.preguntaId} no existe o no está activa`);
        }
        return {
          evaluacion_id: nuevaEval.id,
          pregunta_id: r.preguntaId,
          respuesta: r.respuesta,
          puntaje: r.respuesta ? peso : 0, // Si es true lleva el peso, si es false es 0
        };
      });

      // c. Insertar respuestas masivamente
      await tx.respuesta.createMany({
        data: respuestasData,
      });

      return nuevaEval;
    });

    // 5. Ejecutar Función PostgreSQL para calcular porcentaje y nivel
    await this.prisma.$queryRaw`SELECT fn_calcular_porcentaje(${evaluacion.id}::uuid)`;

    // 6. Retornar la evaluación actualizada
    const evaluacionCompletada = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacion.id },
      select: {
        id: true,
        porcentaje: true,
        nivel: true,
        estado: true,
      },
    });

    return {
      message: 'Evaluación completada con éxito',
      data: evaluacionCompletada,
    };
  }
}