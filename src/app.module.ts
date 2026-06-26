import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { DiagnosticoModule } from './modules/diagnostico/diagnostico.module';
import { EvaluacionModule } from './modules/evaluacion/evaluacion.module';
import { ResultadoModule } from './modules/resultado/resultado.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { IaModule } from './modules/ia/ia.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    AuthModule,
    EmpresaModule,
    DiagnosticoModule,
    EvaluacionModule,
    ResultadoModule,
    DashboardModule,
    ReportesModule,
    IaModule,
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}