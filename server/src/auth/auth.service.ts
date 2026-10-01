import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; username: string }> {
    const expectedUsername = process.env.APP_USERNAME;
    const passwordHash = process.env.APP_PASSWORD_HASH;

    if (!expectedUsername || !passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Se valida usuario y password, pero se devuelve siempre el mismo error
    // genérico para no revelar cuál de los dos fue el que falló.
    const isUsernameValid = username === expectedUsername;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isUsernameValid || !isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: 'single-user', username };
    const token = this.jwtService.sign(payload);

    return { token, username };
  }
}
