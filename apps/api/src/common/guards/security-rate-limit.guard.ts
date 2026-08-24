import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus
} from '@nestjs/common';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

@Injectable()
export class SecurityRateLimitGuard implements CanActivate {
  // In-memory sliding window rate limits: key -> tracker
  private static trackers = new Map<string, RateLimitTracker>();
  private static readonly MAX_TRACKERS = 50000;
  private static cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (!SecurityRateLimitGuard.cleanupTimer) {
      SecurityRateLimitGuard.cleanupTimer = setInterval(() => {
        SecurityRateLimitGuard.cleanupExpiredTrackers();
      }, 2 * 60 * 1000);
      if (SecurityRateLimitGuard.cleanupTimer.unref) {
        SecurityRateLimitGuard.cleanupTimer.unref();
      }
    }
  }

  private static cleanupExpiredTrackers(): void {
    const now = Date.now();
    for (const [key, tracker] of SecurityRateLimitGuard.trackers) {
      if (now > tracker.resetTime) {
        SecurityRateLimitGuard.trackers.delete(key);
      }
    }
  }

  private extractClientIp(request: any): string {
    const cfIp = request.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();

    const realIp = request.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();

    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      const firstIp = forwarded.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    return request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress || '127.0.0.1';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.extractClientIp(request);
    const path = request.route?.path || request.url;
    const method = request.method;

    let maxRequests = 100;
    let windowMs = 60 * 1000; // 1 minute

    // Tailored limits for sensitive endpoints
    if (path.includes('/auth/login')) {
      maxRequests = 10;
      windowMs = 15 * 60 * 1000; // 15 minutes
    } else if (path.includes('/auth/register')) {
      maxRequests = 5;
      windowMs = 60 * 60 * 1000; // 1 hour
    } else if (path.includes('/contact-click')) {
      maxRequests = 25;
      windowMs = 60 * 60 * 1000; // 1 hour (Anti-Scraping)
    } else if (path.includes('/report')) {
      maxRequests = 5;
      windowMs = 60 * 60 * 1000; // 1 hour
    }

    const key = `${ip}:${method}:${path.split('?')[0]}`;
    const now = Date.now();
    const tracker = SecurityRateLimitGuard.trackers.get(key);

    if (!tracker || now > tracker.resetTime) {
      if (SecurityRateLimitGuard.trackers.size >= SecurityRateLimitGuard.MAX_TRACKERS) {
        SecurityRateLimitGuard.cleanupExpiredTrackers();
      }

      SecurityRateLimitGuard.trackers.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (tracker.count >= maxRequests) {
      const waitMinutes = Math.ceil((tracker.resetTime - now) / 60000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Juda ko'p so'rov yuborildi. Iltimos, ${waitMinutes} daqiqadan so'ng qayta urinib ko'ring (Rate limit exceeded).`,
          retryAfterSeconds: Math.ceil((tracker.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    tracker.count++;
    return true;
  }
}
