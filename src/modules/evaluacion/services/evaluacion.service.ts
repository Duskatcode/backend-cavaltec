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

    // 2. Validar Usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (usuario.empresa_id !== empresaId) {
      throw new BadRequestException('El usuario no pertenece a la empresa indicada');
    }

    // 3. Traer preguntas activas
    const preguntas = await this.prisma.pregunta.findMany({
      where: { activo: true },
    });

    if (preguntas.length === 0) {
      throw new BadRequestException('No hay preguntas activas en el sistema');
    }

    const mapaPreguntas = new Map(preguntas.map((p) => [p.id, p.peso]));

    // 4. Crear Evaluación y Respuestas
    const evaluacion = await this.prisma.$transaction(async (tx) => {
      const nuevaEval = await tx.evaluacion.create({
        data: {
          empresa_id: empresaId,
          usuario_id: usuarioId,
          estado: 'EN_PROGRESO',
        },
      });

      const respuestasData = respuestas.map((r) => {
        const peso = mapaPreguntas.get(r.preguntaId);
        if (!peso) {
          throw new BadRequestException(`La pregunta con ID ${r.preguntaId} no existe o no está activa`);
        }
        return {
          evaluacion_id: nuevaEval.id,
          pregunta_id: r.preguntaId,
          respuesta: r.respuesta,
          puntaje: r.respuesta ? peso : 0,
        };
      });

      await tx.respuesta.createMany({
        data: respuestasData,
      });

      return nuevaEval;
    });

    // 5. Calcular porcentaje
    await this.prisma.$queryRaw`SELECT fn_calcular_porcentaje(${evaluacion.id}::uuid)`;

    // 6. Retornar evaluación
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

  async findOne(id: string) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id },
      include: {
        empresa: {
          select: { nombre: true, nit: true },
        },
        usuario: {
          select: { nombre: true, email: true },
        },
        respuestas: {
          include: {
            pregunta: {
              select: { texto: true, categoria: true },
            },
          },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    return {
      success: true,
      message: 'Evaluación recuperada con éxito',
      data: evaluacion,
    };
  }
}