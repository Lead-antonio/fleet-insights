import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from 'src/common/decarators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
