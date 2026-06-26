import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmpresaDto) {
    const existe = await this.prisma.empresa.findUnique({
      where: { nit: dto.nit },
    });

    if (existe) {
      throw new ConflictException({
        success: false,
        message: 'La empresa ya existe',
        errors: [{ field: 'nit', message: 'El NIT ya está registrado' }],
      });
    }

    const empresa = await this.prisma.empresa.create({ data: dto });
    return { message: 'Empresa creada correctamente', data: empresa };
  }

  async findAll() {
    const empresas = await this.prisma.empresa.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: { created_at: 'desc' },
    });
    return { message: 'Empresas obtenidas correctamente', data: empresas };
  }

  async findOne(id: string) {
    const empresa = await this.prisma.empresa.findFirst({
      where: { id, estado: 'ACTIVO' },
    });

    if (!empresa) {
      throw new NotFoundException({
        success: false,
        message: 'Empresa no encontrada',
        errors: [],
      });
    }

    return { message: 'Empresa obtenida correctamente', data: empresa };
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    await this.findOne(id);

    const empresa = await this.prisma.empresa.update({
      where: { id },
      data: dto,
    });

    return { message: 'Empresa actualizada correctamente', data: empresa };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.empresa.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'Empresa eliminada correctamente', data: null };
  }
}
