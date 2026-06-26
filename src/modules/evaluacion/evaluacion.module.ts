import { Module } from '@nestjs/common';
// Subes 2 niveles para salir de 'evaluacion' y 'modules', luego entras a 'controllers'
import { EvaluacionController } from './controllers/evaluacion.controller';
// Subes 2 niveles para salir de 'evaluacion' y 'modules', luego entras a 'services'
import { EvaluacionService } from './services/evaluacion.service';
// Subes 3 niveles para llegar a 'src', luego entras a 'infrastructure/database/prisma/prisma.module'
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluacionController],
  providers: [EvaluacionService],
})
export class EvaluacionModule {}