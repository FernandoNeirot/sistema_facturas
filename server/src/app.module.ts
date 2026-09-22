import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, ClientsModule, InvoicesModule],
  controllers: [HealthController],
})
export class AppModule {}
