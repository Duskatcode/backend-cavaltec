import { Module } from '@nestjs/common';
import { ResultadoController } from './controllers/resultado.controller';
import { ResultadoService } from './services/resultado.service';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResultadoController],
  providers: [ResultadoService],
})
export class ResultadoModule {}