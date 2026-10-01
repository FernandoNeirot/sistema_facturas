import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; username: string }> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    // Si el usuario no existe igual se corre bcrypt.compare contra un hash
    // dummy, para no filtrar por timing si el username existe o no.
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.passwordHash ?? '$2b$10$invalidinvalidinvalidu.invalidinvalidinvalidinvalidin',
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return { token, username: user.username };
  }
}
