import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportesService } from '../services/reportes.service';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Public()
  @Get(':evaluacionId/pdf')
  @ApiOperation({ summary: 'Descargar reporte PDF' })
  @ApiParam({ name: 'evaluacionId', type: String })
  async generar(@Param('evaluacionId') evaluacionId: string, @Res() res: Response) {
    const pdf = await this.reportesService.generarPdf(evaluacionId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=reporte-cavaltec-${evaluacionId}.pdf`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }
}
