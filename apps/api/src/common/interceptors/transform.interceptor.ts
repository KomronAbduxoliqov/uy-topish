import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => {
        // Strip sensitive fields recursively
        const sanitized = this.stripSensitiveFields(data);

        // If data is already structured with meta (e.g. pagination), preserve it
        if (sanitized && typeof sanitized === 'object' && 'items' in sanitized && 'total' in sanitized) {
          return {
            success: true,
            data: sanitized.items,
            meta: {
              total: sanitized.total,
              page: sanitized.page,
              limit: sanitized.limit,
              totalPages: Math.ceil(sanitized.total / (sanitized.limit || 10))
            }
          };
        }
        return {
          success: true,
          data: sanitized
        };
      })
    );
  }

  private stripSensitiveFields(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.stripSensitiveFields(item));
    }

    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Sensitive fields to never expose in HTTP responses
      if (
        key === 'passwordHash' ||
        key === 'password' ||
        key === 'refreshToken' ||
        key === 'salt'
      ) {
        continue;
      }
      const val = obj[key];
      clean[key] = typeof val === 'object' ? this.stripSensitiveFields(val) : val;
    }
    return clean;
  }
}
