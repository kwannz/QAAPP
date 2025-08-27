import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PerformanceService } from './performance.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly performanceService: PerformanceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestId = uuidv4();
    const request = context.switchToHttp().getRequest();
    const endpoint = `${request.method} ${request.route?.path || request.url}`;

    // Start timing
    this.performanceService.startTimer(requestId);

    return next.handle().pipe(
      tap(() => {
        // End timing
        this.performanceService.endTimer(requestId, endpoint);
      }),
    );
  }
}