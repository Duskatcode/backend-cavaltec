import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3002',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('API CAVALTEC')
    .setDescription('Plataforma de diagnóstico Ley 1581 de 2012 — Protección de Datos Personales')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'JWT')
    .addTag('Auth', 'Autenticación OAuth con Google')
    .addTag('Empresa', 'Gestión de empresas cliente')
    .addTag('Diagnostico', 'Catálogo de preguntas Ley 1581')
    .addTag('Evaluacion', 'Sesiones de diagnóstico')
    .addTag('Resultado', 'Resultados y brechas de cumplimiento')
    .addTag('Dashboard', 'Métricas y estadísticas')
    .addTag('Reportes', 'Generación de reportes PDF')
    .addTag('IA', 'Chat diagnóstico con IA (Groq llama-3.3-70b)')
    .addTag('Health', 'Estado del servidor')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Servidor corriendo en http://localhost:3000/api/v1');
  console.log('📝 Swagger en http://localhost:3000/api/docs');
}
void bootstrap();
