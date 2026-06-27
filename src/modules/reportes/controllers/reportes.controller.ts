import {
  Controller,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from '../services/reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
  ) {}

  @Get(':evaluacionId/pdf')
  async generar(
    @Param('evaluacionId') evaluacionId: string,
    @Res() res: Response,
  ) {
    const pdf =
      await this.reportesService.generarPdf(
        evaluacionId,
      );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=reporte.pdf',
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }
}
