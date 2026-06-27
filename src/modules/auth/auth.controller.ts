import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar sesión con Google' })
  @ApiResponse({ status: 302, description: 'Redirige a Google OAuth' })
  async googleAuth(@Req() req: Request) {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback OAuth Google' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const { access_token, usuario } = req.user as any;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002'\;
      const usuarioEncoded = encodeURIComponent(JSON.stringify(usuario));
      res.redirect(
        `${frontendUrl}/auth/callback?token=${access_token}&usuario=${usuarioEncoded}`
      );
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002'\;
      res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
    }
  }
}
