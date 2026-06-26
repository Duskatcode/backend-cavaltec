import { Controller, Post, Body, Get, Param, ParseUUIDPipe } from '@nestjs/common'; // Asegúrate de importar Get, Param y ParseUUIDPipe
import { EvaluacionService } from '../services/evaluacion.service';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';


@Controller('evaluaciones') // <--- Esto define el prefijo de la clase
export class EvaluacionController {
  constructor(private readonly evaluacionService: EvaluacionService) {}

  @Get(':id') // <--- Esto debería responder a /evaluaciones/:id
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.evaluacionService.findOne(id);
  }

  @Post()
  async crear(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    return await this.evaluacionService.crearEvaluacion(createEvaluacionDto);
  }
}