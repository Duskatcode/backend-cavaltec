import { Module } from '@nestjs/common';
import { IaController } from './controllers/ia.controller';
import { IaService } from './services/ia.service';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IaController],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}
