import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // Nếu kết quả bị rỗng
        if (data === null || data === undefined) {
            return { data };
        }
        
        // Nếu kết quả đã được bọc sẵn trường 'data' (ví dụ ở các hàm get list có phân trang)
        if (typeof data === 'object' && 'data' in data) {
          return data;
        }
        
        // Tất cả các trường hợp còn lại (Object thường, String, Array) -> bọc vào { data }
        return { data };
      }),
    );
  }
}
