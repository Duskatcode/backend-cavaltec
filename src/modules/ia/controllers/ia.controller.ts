import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IaService } from '../services/ia.service';
import { ExplicarDto, ChatIaDto } from '../dto/explicar.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('IA')
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Public()
  @Post('explicar')
  @ApiOperation({ summary: 'Explicar concepto con IA' })
  async explicar(@Body() dto: ExplicarDto) {
    const explicacion = await this.iaService.explicar(dto.pregunta);
    return { explicacion };
  }

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Chat diagnóstico IA' })
  @ApiResponse({ status: 201, schema: { example: { success: true, message: 'OK', data: { mensaje: '...', finalizado: false, evaluacion_id: null } } } })
  async chat(@Body() dto: ChatIaDto) {
    return this.iaService.chat(dto);
  }
}
