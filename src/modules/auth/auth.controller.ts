import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { access_token, usuario } = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const usuarioEncoded = encodeURIComponent(JSON.stringify(usuario));
    res.redirect(
      `${frontendUrl}/auth/callback?token=${access_token}&usuario=${usuarioEncoded}`
    );
  }
}
