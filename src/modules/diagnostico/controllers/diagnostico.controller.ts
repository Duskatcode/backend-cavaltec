import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosticoService } from '../services/diagnostico.service';
import { CreatePreguntaDto } from '../dto/create-pregunta.dto';
import { UpdatePreguntaDto } from '../dto/update-pregunta.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Diagnostico')
@Controller('diagnosticos')
export class DiagnosticoController {
  constructor(private readonly diagnosticoService: DiagnosticoService) {}

  @Public()
  @Get('preguntas')
  @ApiOperation({ summary: 'Listar preguntas activas' })
  @ApiQuery({ name: 'categoria', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Preguntas obtenidas' })
  findAll(@Query('categoria') categoria?: string) {
    if (categoria) return this.diagnosticoService.findByCategoria(categoria);
    return this.diagnosticoService.findAll();
  }

  @Public()
  @Get('preguntas/:id')
  @ApiOperation({ summary: 'Obtener pregunta por ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.diagnosticoService.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @Post('preguntas')
  @ApiOperation({ summary: 'Crear pregunta (solo ADMIN)' })
  create(@Body() dto: CreatePreguntaDto) {
    return this.diagnosticoService.create(dto);
  }

  @ApiBearerAuth('JWT')
  @Patch('preguntas/:id')
  @ApiOperation({ summary: 'Actualizar pregunta (solo ADMIN)' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id') id: string, @Body() dto: UpdatePreguntaDto) {
    return this.diagnosticoService.update(id, dto);
  }

  @ApiBearerAuth('JWT')
  @Delete('preguntas/:id')
  @ApiOperation({ summary: 'Desactivar pregunta (solo ADMIN)' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.diagnosticoService.remove(id);
  }
}
