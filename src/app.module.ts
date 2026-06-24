import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [PrismaModule, ApiModule],
})
export class AppModule {}
