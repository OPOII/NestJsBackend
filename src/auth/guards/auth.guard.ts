import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as request from 'supertest';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor(
    private jwtService:JwtService,
    private authService:AuthService
  ){}
  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request=context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('There is no bearer token');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_SEED
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      // const usuario=payload.id
      const usuario=await this.authService.findUserById(payload.id);
      if(!usuario)throw new UnauthorizedException('User doesnt exist');
      if(!usuario.isActive)throw new UnauthorizedException('User is not active');
      request['user'] = usuario
    } catch {
      throw new UnauthorizedException();
    }
    console.log({token});
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
