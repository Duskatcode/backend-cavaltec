import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: {
    email: string;
    firstName: string;
    lastName: string;
    oauthId: string;
    picture?: string;
  }) {
    // Buscar empresa por defecto o crear una para el usuario
    let empresa = await this.prisma.empresa.findFirst({
      where: { estado: 'ACTIVO' },
      orderBy: { created_at: 'asc' },
    });

    // Si no hay empresa, crear una temporal
    if (!empresa) {
      empresa = await this.prisma.empresa.create({
        data: {
          nombre: 'Empresa por configurar',
          nit: `TEMP-${Date.now()}`,
          sector: 'Sin definir',
          tamano: 'PYME',
          estado: 'ACTIVO',
        },
      });
    }

    // Upsert usuario — crea si no existe, actualiza si existe
    const usuario = await this.prisma.usuario.upsert({
      where: {
        empresa_id_email: {
          empresa_id: empresa.id,
          email: profile.email,
        },
      },
      update: {
        oauth_id: profile.oauthId,
        oauth_provider: 'GOOGLE',
        activo: true,
      },
      create: {
        empresa_id: empresa.id,
        nombre: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        rol: 'USUARIO',
        oauth_id: profile.oauthId,
        oauth_provider: 'GOOGLE',
        activo: true,
      },
    });

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresa_id: usuario.empresa_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id,
      },
    };
  }

  async validateJwt(payload: any) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: payload.sub, activo: true },
    });
    return usuario || null;
  }
}
