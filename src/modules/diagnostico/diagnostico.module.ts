import { Module } from '@nestjs/common';
import { DiagnosticoController } from './controllers/diagnostico.controller';
import { DiagnosticoService } from './services/diagnostico.service';

@Module({
  controllers: [DiagnosticoController],
  providers: [DiagnosticoService],
  exports: [DiagnosticoService],
})
export class DiagnosticoModule {}
