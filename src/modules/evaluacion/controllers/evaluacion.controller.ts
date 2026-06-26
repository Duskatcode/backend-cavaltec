import { Controller, Post, Body } from '@nestjs/common';
import { EvaluacionService } from '../services/evaluacion.service';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';

@Controller('evaluaciones')
export class EvaluacionController {
  constructor(private readonly evaluacionService: EvaluacionService) {}

  @Post()
  async crear(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    return await this.evaluacionService.crearEvaluacion(createEvaluacionDto);
  }
}