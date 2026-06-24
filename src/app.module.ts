import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ApiModule } from './api/api.module.js';

@Module({
  imports: [PrismaModule, ApiModule],
})
export class AppModule {}
