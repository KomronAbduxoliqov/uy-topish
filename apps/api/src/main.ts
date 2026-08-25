import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SecurityRateLimitGuard } from './common/guards/security-rate-limit.guard';
import { SanitizeInputPipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const logger = new Logger('UyTop-API');
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const isProduction = process.env.NODE_ENV === 'production';

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use((_, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('X-Download-Options', 'noopen');
    response.setHeader('X-DNS-Prefetch-Control', 'off');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    response.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    if (isProduction) {
      response.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
    next();
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Production CORS Configuration
  const defaultOrigins = ['http://localhost:3000', 'https://uytop.uz', 'https://www.uytop.uz', 'https://staging.uytop.uz'];
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : defaultOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, health-checks, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, X-Locale',
  });

  // Global Security Guards & Pipes
  app.useGlobalGuards(new SecurityRateLimitGuard());
  app.useGlobalPipes(
    new SanitizeInputPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI 3.0 Documentation
  if (!isProduction && process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('UyTop API — O\'zbekiston Ko\'chmas Mulk Platformasi')
      .setDescription('Map + AI + Spatial Geo Search + Verified Listings API for Uzbekistan')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 UyTop API is running on port ${port} (Environment: ${process.env.NODE_ENV || 'development'})`);
  logger.log(`📚 Health status endpoint available at /api/v1/health & /api/v1/health/ready`);
}

bootstrap();
