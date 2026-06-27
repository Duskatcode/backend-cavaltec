import { Body, Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IaService } from '../services/ia.service';
import { ExplicarDto, ChatIaDto } from '../dto/explicar.dto';

@ApiTags('IA')
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('explicar')
  @ApiOperation({ summary: 'Explicar concepto de ciberseguridad con IA' })
  @ApiResponse({ status: 201, schema: { example: { success: true, message: 'OK', data: { explicacion: '...' } } } })
  async explicar(@Body() dto: ExplicarDto) {
    const explicacion = await this.iaService.explicar(dto.pregunta);
    return { explicacion };
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Chat diagnóstico IA',
    description: 'Endpoint principal del diagnóstico conversacional. El front envía historial + mensaje y recibe la siguiente pregunta o el resultado final.',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        success: true,
        message: 'OK',
        data: {
          mensaje: '¿La empresa cuenta con una Política de Tratamiento de Datos Personales?',
          finalizado: false,
          evaluacion_id: null,
        },
      },
    },
  })
  async chat(@Body() dto: ChatIaDto) {
    return this.iaService.chat(dto);
  }
}
