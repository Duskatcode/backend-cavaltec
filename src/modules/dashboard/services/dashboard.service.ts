import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard(
    empresaId?: string,
  ): Promise<DashboardResponseDto> {
    const empresa = await this.getEmpresa(empresaId);

    const metricas = await this.getMetricas(empresa.id);

    const niveles = await this.getNivelStats(empresa.id);

    return {
      empresa,
      metricas,
      niveles,
    };
  }

  private async getEmpresa(
    empresaId?: string,
  ) {
    if (!empresaId) {
      throw new NotFoundException('Debe enviar empresaId');
    }

    const empresa = await this.prisma.empresa.findUnique({
      where: {
        id: empresaId,
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  private async getMetricas(
    empresaId: string,
  ) {
    const aggregate =
      await this.prisma.evaluacion.aggregate({
        where: {
          empresa_id: empresaId,
        },
        _count: {
          id: true,
        },
        _avg: {
          porcentaje: true,
        },
        _max: {
          fecha_fin: true,
        },
      });

    return {
      evaluaciones: aggregate._count.id,
      promedioCumplimiento:
        Number(aggregate._avg.porcentaje ?? 0),
      ultimaEvaluacion:
        aggregate._max.fecha_fin,
    };
  }

  private async getNivelStats(
    empresaId: string,
  ) {
    const niveles =
      await this.prisma.evaluacion.groupBy({
        by: ['nivel'],
        where: {
          empresa_id: empresaId,
        },
        _count: true,
      });

    const resultado = {
      excelente: 0,
      bueno: 0,
      regular: 0,
      critico: 0,
    };

    niveles.forEach((n) => {
      switch (n.nivel?.toUpperCase()) {
        case 'EXCELENTE':
          resultado.excelente = n._count;
          break;

        case 'BUENO':
          resultado.bueno = n._count;
          break;

        case 'REGULAR':
          resultado.regular = n._count;
          break;

        case 'CRITICO':
          resultado.critico = n._count;
          break;
      }
    });

    return resultado;
  }
}