import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Response } from 'express';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Liveness Probe — Basic application health check' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getLiveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'uytop-api',
      version: '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness Probe — Database and dependent services check' })
  @ApiResponse({ status: 200, description: 'All database and spatial engines are ready' })
  @ApiResponse({ status: 503, description: 'One or more dependencies are unavailable' })
  async getReadiness(@Res() res: Response) {
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
    let isHealthy = true;

    // 1. PostgreSQL Database Check
    const startDb = Date.now();
    try {
      if (this.dataSource.isInitialized) {
        // Query PostgreSQL version to ensure database is responsive
        const result = await this.dataSource.query('SELECT version() AS pg_version, now() AS db_time');
        checks.database = {
          status: 'up',
          latencyMs: Date.now() - startDb,
        };
      } else {
        isHealthy = false;
        checks.database = { status: 'down', error: 'DataSource not initialized' };
      }
    } catch (err: any) {
      isHealthy = false;
      checks.database = { status: 'down', error: err.message };
    }

    const payload = {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };

    if (isHealthy) {
      return res.status(HttpStatus.OK).json(payload);
    } else {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(payload);
    }
  }
}
