import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Necessário para webhook do Stripe
  });

  // Enable CORS - permitir todos os domínios Vercel e localhost
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.WEB_URL,
      ];
      
      // Permitir requisições sem origin (ex: Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }
      
      // Permitir qualquer subdomínio do Vercel e localhost/127.0.0.1
      if (origin.includes('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Verificar lista de origens permitidas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(null, true); // Temporariamente permitir todas para debug
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Tenant'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
