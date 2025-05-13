// jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    // Gọi super() để khởi tạo AuthGuard gốc.
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    // Ngược lại, chạy tiếp logic xác thực JWT của AuthGuard gốc:
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any, info: Error) {
    if (info instanceof TokenExpiredError) {
      // Trả về 401 với message rõ “Token hết hạn”
      throw new UnauthorizedException('Tokens expire');
    }
    // Lỗi khác hoặc không có user thì ném mặc định
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    console.log('====================================');
    console.log('user : ', user);
    console.log('====================================');
    return user;
  }
}
