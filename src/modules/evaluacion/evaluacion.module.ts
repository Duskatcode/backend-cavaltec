import { Module } from '@nestjs/common';
import { EvaluacionController } from './controllers/evaluacion.controller';
import { EvaluacionService } from './services/evaluacion.service';

@Module({
  controllers: [EvaluacionController],
  providers: [EvaluacionService],
})
export class EvaluacionModule {}