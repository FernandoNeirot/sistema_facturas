import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        // Ventana de 1 minuto, hasta 300 requests: generoso para el uso
        // normal de una sola persona desde el frontend, pero corta abuso
        // (scripts, escaneos) si la API queda expuesta accidentalmente.
        ttl: 60_000,
        limit: 300,
      },
    ]),
    PrismaModule,
    AuthModule,
    ClientsModule,
    InvoicesModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
