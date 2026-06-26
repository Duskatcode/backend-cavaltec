import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardService } from '../services/dashboard.service';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener métricas generales del dashboard',
  })
  @ApiQuery({
    name: 'empresaId',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: DashboardResponseDto,
  })
  async getDashboard(
    @Query('empresaId') empresaId?: string,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(empresaId);
  }
}
