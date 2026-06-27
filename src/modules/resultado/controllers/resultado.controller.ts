import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ResultadoService } from '../services/resultado.service';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Resultado')
@Controller('resultados')
export class ResultadoController {
  constructor(private readonly resultadoService: ResultadoService) {}

  @Public()
  @Get(':evaluacionId')
  @ApiOperation({ summary: 'Obtener resultados y brechas' })
  @ApiParam({ name: 'evaluacionId', type: String })
  async obtener(@Param('evaluacionId', ParseUUIDPipe) evaluacionId: string) {
    const data = await this.resultadoService.obtenerResultados(evaluacionId);
    return { message: 'Resultados obtenidos correctamente', data };
  }
}
