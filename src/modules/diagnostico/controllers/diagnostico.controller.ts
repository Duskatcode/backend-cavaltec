import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DiagnosticoService } from '../services/diagnostico.service';
import { CreatePreguntaDto } from '../dto/create-pregunta.dto';
import { UpdatePreguntaDto } from '../dto/update-pregunta.dto';

@Controller('diagnosticos')
export class DiagnosticoController {
  constructor(private readonly diagnosticoService: DiagnosticoService) {}

  @Get('preguntas')
  findAll(@Query('categoria') categoria?: string) {
    if (categoria) {
      return this.diagnosticoService.findByCategoria(categoria);
    }
    return this.diagnosticoService.findAll();
  }

  @Get('preguntas/:id')
  findOne(@Param('id') id: string) {
    return this.diagnosticoService.findOne(id);
  }

  @Post('preguntas')
  create(@Body() dto: CreatePreguntaDto) {
    return this.diagnosticoService.create(dto);
  }

  @Patch('preguntas/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePreguntaDto) {
    return this.diagnosticoService.update(id, dto);
  }

  @Delete('preguntas/:id')
  remove(@Param('id') id: string) {
    return this.diagnosticoService.remove(id);
  }
}
