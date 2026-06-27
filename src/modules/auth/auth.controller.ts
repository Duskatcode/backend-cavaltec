import { Controller, Get, Req, Res, Next, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import * as passport from 'passport';
import { Public } from '../../common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar sesion con Google' })
  @ApiResponse({ status: 302, description: 'Redirige a Google OAuth' })
  async googleAuth(@Req() req: Request) {}

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Callback OAuth Google' })
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: any,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    passport.authenticate('google', (err: any, user: any) => {
      if (err || !user) {
        console.error('OAuth error:', err?.message || 'No user');
        return res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
      }

      try {
        const { access_token, usuario } = user;
        const usuarioEncoded = encodeURIComponent(JSON.stringify(usuario));
        return res.redirect(
          `${frontendUrl}/auth/callback?token=${access_token}&usuario=${usuarioEncoded}`
        );
      } catch (e) {
        return res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
      }
    })(req, res, next);
  }
}
