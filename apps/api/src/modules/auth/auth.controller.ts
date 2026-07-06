import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: { email: string; phone: string; password: string; name: string; tenantName: string }) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: { email?: string; phone?: string; password: string }) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
}
