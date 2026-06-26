import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { CreatePreguntaDto } from '../dto/create-pregunta.dto';
import { UpdatePreguntaDto } from '../dto/update-pregunta.dto';

@Injectable()
export class DiagnosticoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const preguntas = await this.prisma.pregunta.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });
    return { message: 'Preguntas obtenidas correctamente', data: preguntas };
  }

  async findOne(id: string) {
    const pregunta = await this.prisma.pregunta.findFirst({
      where: { id, activo: true },
    });

    if (!pregunta) {
      throw new NotFoundException({
        success: false,
        message: 'Pregunta no encontrada',
        errors: [],
      });
    }

    return { message: 'Pregunta obtenida correctamente', data: pregunta };
  }

  async create(dto: CreatePreguntaDto) {
    const pregunta = await this.prisma.pregunta.create({ data: dto });
    return { message: 'Pregunta creada correctamente', data: pregunta };
  }

  async update(id: string, dto: UpdatePreguntaDto) {
    await this.findOne(id);

    const pregunta = await this.prisma.pregunta.update({
      where: { id },
      data: dto,
    });

    return { message: 'Pregunta actualizada correctamente', data: pregunta };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.pregunta.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Pregunta desactivada correctamente', data: null };
  }

  async findByCategoria(categoria: string) {
    const preguntas = await this.prisma.pregunta.findMany({
      where: { activo: true, categoria },
      orderBy: { orden: 'asc' },
    });
    return { message: 'Preguntas por categoría obtenidas', data: preguntas };
  }
}
