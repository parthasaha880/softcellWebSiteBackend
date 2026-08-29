import { Module } from '@nestjs/common';
import { PressReleasesController } from './press-releases.controller';
import { PressReleasesService } from './press-releases.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PressReleasesController],
  providers: [PressReleasesService],
  exports: [PressReleasesService],
})
export class PressReleasesModule {}
