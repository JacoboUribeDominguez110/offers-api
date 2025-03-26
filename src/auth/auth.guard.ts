import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new WsException('Token missing');
    }

    try {
      const decoded = this.jwtService.verify(token);
      client.data.user = decoded;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }
}
