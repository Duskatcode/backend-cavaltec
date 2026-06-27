import { Controller, Post, Body, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EvaluacionService } from '../services/evaluacion.service';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Evaluacion')
@Controller('evaluaciones')
export class EvaluacionController {
  constructor(private readonly evaluacionService: EvaluacionService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener evaluación por ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.evaluacionService.findOne(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Crear evaluación' })
  async crear(@Body() dto: CreateEvaluacionDto) {
    return await this.evaluacionService.crearEvaluacion(dto);
  }
}
