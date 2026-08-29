import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private svc: ChatbotService) {}

  @Public() @Get('questions')
  findQuestions(@Query('category') category?: string) { return this.svc.findQuestions(category); }

  @Public() @Post('ask')
  ask(@Body('query') query: string) { return this.svc.findAnswer(query); }

  @Public() @Post('sessions')
  createSession(@Body() data: any) { return this.svc.createSession(data); }

  @Public() @Post('sessions/:id/messages')
  addMessage(@Param('id') id: string, @Body() data: any) { return this.svc.addMessage(id, data); }

  @Public() @Get('sessions/:id')
  getSession(@Param('id') id: string) { return this.svc.getSession(id); }

  // Admin
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Get('admin/questions') findAllQuestions() { return this.svc.findAllQuestions(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Post('admin/questions') createQuestion(@Body() data: any) { return this.svc.createQuestion(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Put('admin/questions/:id') updateQuestion(@Param('id') id: string, @Body() data: any) { return this.svc.updateQuestion(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete('admin/questions/:id') deleteQuestion(@Param('id') id: string) { return this.svc.deleteQuestion(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('admin/sessions') findActiveSessions() { return this.svc.findActiveSessions(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Post('admin/sessions/:id/close') closeSession(@Param('id') id: string) { return this.svc.closeSession(id); }
}
