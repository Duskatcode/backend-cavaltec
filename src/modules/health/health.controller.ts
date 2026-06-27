import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Estado del servidor' })
  @ApiResponse({ status: 200, schema: { example: { success: true, message: 'OK', data: { status: 'ok' } } } })
  async check() {
    return this.healthService.check();
  }
}
