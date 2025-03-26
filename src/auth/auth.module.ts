import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

const HOURS = 24;
const DAYS = 15;
const tokenExpiration = DAYS * HOURS;

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: (tokenExpiration + 'h') },
    })
  ],
  providers: [AuthService],
  exports: [JwtModule, AuthService]
})
export class AuthModule {}
