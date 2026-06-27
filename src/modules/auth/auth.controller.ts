import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar sesión con Google', description: 'Redirige al flujo OAuth de Google. No requiere token.' })
  @ApiResponse({ status: 302, description: 'Redirige a Google OAuth' })
  async googleAuth(@Req() req) {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback OAuth Google', description: 'Redirige al frontend con JWT en query param.' })
  @ApiResponse({ status: 302, description: 'Redirige a /auth/callback?token=...&usuario=...' })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { access_token, usuario } = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const usuarioEncoded = encodeURIComponent(JSON.stringify(usuario));
    res.redirect(
      `${frontendUrl}/auth/callback?token=${access_token}&usuario=${usuarioEncoded}`
    );
  }
}
