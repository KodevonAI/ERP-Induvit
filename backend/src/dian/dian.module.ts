import { Module } from '@nestjs/common';
import { DianController } from './dian.controller';
import { DianService } from './dian.service';

@Module({
  controllers: [DianController],
  providers: [DianService],
})
export class DianModule {}
