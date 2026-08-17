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
        // If data is already structured with meta (e.g. pagination), preserve it
        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          return {
            success: true,
            data: data.items,
            meta: {
              total: data.total,
              page: data.page,
              limit: data.limit,
              totalPages: Math.ceil(data.total / (data.limit || 10))
            }
          };
        }
        return {
          success: true,
          data
        };
      })
    );
  }
}
