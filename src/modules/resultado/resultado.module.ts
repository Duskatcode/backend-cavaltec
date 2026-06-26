import { Module } from '@nestjs/common';
import { ResultadoController } from './controllers/resultado.controller';
import { ResultadoService } from './services/resultado.service';

@Module({
  controllers: [ResultadoController],
  providers: [ResultadoService],
})
export class ResultadoModule {}