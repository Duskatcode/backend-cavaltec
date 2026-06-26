import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ResultadoService } from '../services/resultado.service';

@Controller('resultados')
export class ResultadoController {
  constructor(private readonly resultadoService: ResultadoService) {}

  @Get(':evaluacionId')
  async obtener(@Param('evaluacionId', ParseUUIDPipe) evaluacionId: string) {
    const data = await this.resultadoService.obtenerResultados(evaluacionId);
    return {
      message: 'Resultados obtenidos correctamente',
      data,
    };
  }
}