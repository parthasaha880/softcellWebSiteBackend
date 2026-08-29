import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { PagesModule } from "./modules/pages/pages.module";
import { MediaModule } from "./modules/media/media.module";
import { ServicesModule } from "./modules/services/services.module";
import { ProductsModule } from "./modules/products/products.module";
import { BlogModule } from "./modules/blog/blog.module";
import { CaseStudiesModule } from "./modules/case-studies/case-studies.module";
import { TeamModule } from "./modules/team/team.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { CertificationsModule } from "./modules/certifications/certifications.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { ContactModule } from "./modules/contact/contact.module";
import { NewsletterModule } from "./modules/newsletter/newsletter.module";
import { CareersModule } from "./modules/careers/careers.module";
import { TestimonialsModule } from "./modules/testimonials/testimonials.module";
import { FaqModule } from "./modules/faq/faq.module";
import { PartnersModule } from "./modules/partners/partners.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { ChatbotModule } from "./modules/chatbot/chatbot.module";
import { SystemModule } from "./modules/system/system.module";
import { SnippetsModule } from "./modules/snippets/snippets.module";
import { SearchModule } from "./modules/search/search.module";
import { HealthModule } from "./modules/health/health.module";
import { ResourcesModule } from "./modules/resources/resources.module";
import { PressReleasesModule } from "./modules/press-releases/press-releases.module";
import { CookieConsentModule } from "./modules/cookie-consent/cookie-consent.module";
import { HeroSlidesModule } from "./modules/hero-slides/hero-slides.module";
import { GalleryModule } from "./modules/gallery/gallery.module";
import { EmailModule } from "./modules/email/email.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PagesModule,
    MediaModule,
    ServicesModule,
    ProductsModule,
    BlogModule,
    CaseStudiesModule,
    TeamModule,
    ClientsModule,
    CertificationsModule,
    ProjectsModule,
    LeadsModule,
    ContactModule,
    NewsletterModule,
    CareersModule,
    TestimonialsModule,
    FaqModule,
    PartnersModule,
    CampaignsModule,
    AnalyticsModule,
    NotificationsModule,
    AuditModule,
    SettingsModule,
    ChatbotModule,
    SystemModule,
    SnippetsModule,
    SearchModule,
    HealthModule,
    ResourcesModule,
    PressReleasesModule,
    CookieConsentModule,
    HeroSlidesModule,
    GalleryModule,
    EmailModule,
  ],
})
export class AppModule {}
