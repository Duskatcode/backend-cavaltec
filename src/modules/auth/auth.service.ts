import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: any) {
    const user = await this.prisma.usuario.findFirst({
      where: { email: profile.email },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en el sistema');
    }

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        oauth_id: profile.oauthId,
        oauth_provider: 'GOOGLE',
      },
    });

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
