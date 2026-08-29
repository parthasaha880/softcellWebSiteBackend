import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}

  // Pre-defined Q&A
  async findQuestions(category?: string) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    return this.prisma.chatbotQuestion.findMany({ where, orderBy: { order: 'asc' } });
  }

  async findAnswer(query: string) {
    const questions = await this.prisma.chatbotQuestion.findMany({ where: { isActive: true } });
    const lowerQuery = query.toLowerCase();
    const match = questions.find(q => q.keywords.some(k => lowerQuery.includes(k.toLowerCase())) || q.question.toLowerCase().includes(lowerQuery));
    return match || { answer: "I'm sorry, I couldn't find an answer. Please contact us directly or try rephrasing your question." };
  }

  async createQuestion(data: any) { return this.prisma.chatbotQuestion.create({ data }); }
  async updateQuestion(id: string, data: any) { return this.prisma.chatbotQuestion.update({ where: { id }, data }); }
  async deleteQuestion(id: string) { await this.prisma.chatbotQuestion.delete({ where: { id } }); return { message: 'Deleted' }; }
  async findAllQuestions() { return this.prisma.chatbotQuestion.findMany({ orderBy: { order: 'asc' } }); }

  // Chat sessions
  async createSession(data: any) { return this.prisma.chatSession.create({ data }); }
  async addMessage(sessionId: string, data: any) { return this.prisma.chatMessage.create({ data: { ...data, sessionId } }); }
  async getSession(id: string) {
    const session = await this.prisma.chatSession.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
  async findActiveSessions() { return this.prisma.chatSession.findMany({ where: { closedAt: null }, include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { updatedAt: 'desc' } }); }
  async closeSession(id: string) { return this.prisma.chatSession.update({ where: { id }, data: { closedAt: new Date() } }); }
}
