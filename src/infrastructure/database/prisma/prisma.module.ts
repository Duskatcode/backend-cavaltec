import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
// IMPORTANTE: Asegúrate de que tenga 'export' aquí abajo:
export class PrismaModule {}