import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './guard/local.strategy';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { APP_GUARD } from '@nestjs/core/constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET') ?? 'default_secret';
        const expiresIn: number = Number(config.get('JWT_EXPIRES_IN_SECONDS')) || 86400;
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy ,UsersService,  {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }],
  controllers: [AuthController]
})
export class AuthModule {}
