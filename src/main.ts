import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 1. Importación necesaria

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // 2. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API CAVALTEC')
    .setDescription('Documentación de los endpoints de la plataforma CAVALTEC')
    .setVersion('1.0')
    .addTag('empresas')
    .addTag('evaluaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // La UI estará en http://localhost:3000/api/docs

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Servidor corriendo en http://localhost:3000/api/v1');
  console.log('📝 Documentación Swagger en http://localhost:3000/api/docs');
}
void bootstrap();