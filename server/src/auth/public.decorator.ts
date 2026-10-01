import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca una ruta o un controller entero como público, es decir, exento
 * del `JwtAuthGuard` global. Usar en `POST /auth/login` y en `GET /health`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
