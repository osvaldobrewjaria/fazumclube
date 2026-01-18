import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      commit: process.env.GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
