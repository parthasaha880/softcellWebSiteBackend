import { Module } from '@nestjs/common';
import { CookieConsentController } from './cookie-consent.controller';
import { CookieConsentService } from './cookie-consent.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CookieConsentController],
  providers: [CookieConsentService],
  exports: [CookieConsentService],
})
export class CookieConsentModule {}
