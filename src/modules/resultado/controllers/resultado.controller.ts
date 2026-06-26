import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ResultadoService } from '../services/resultado.service';

@Controller('resultados')
export class ResultadoController {
  constructor(private readonly resultadoService: ResultadoService) {}

  // GET /api/v1/resultados/:evaluacionId
  @Get(':evaluacionId')
  async obtener(@Param('evaluacionId', ParseUUIDPipe) evaluacionId: string) {
    return await this.resultadoService.obtenerResultados(evaluacionId);
  }
}