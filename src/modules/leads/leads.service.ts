import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(
    query: PaginationDto & {
      status?: string;
      source?: string;
      assigneeId?: string;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      source,
      assigneeId,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search)
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    if (status) where.status = status;
    if (source) where.source = source;
    if (assigneeId) where.assigneeId = assigneeId;
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignee: { select: { id: true, name: true } },
          notes: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true } },
        client: true,
        notes: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        events: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!lead) throw new NotFoundException("Lead not found");
    return lead;
  }

  async create(data: any) {
    const lead = await this.prisma.lead.create({ data });

    // Send confirmation email to lead
    if (lead.email && lead.name) {
      await this.emailService.sendLeadConfirmationToUser({
        name: lead.name,
        email: lead.email,
      });
    }

    return lead;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const lead = await this.prisma.lead.update({ where: { id }, data });
    await this.prisma.leadEvent.create({
      data: {
        leadId: id,
        type: "STATUS_CHANGE",
        data: { status: data.status },
      },
    });
    return lead;
  }

  async addNote(leadId: string, userId: string, content: string) {
    return this.prisma.leadNote.create({ data: { leadId, userId, content } });
  }

  async assign(id: string, assigneeId: string) {
    return this.prisma.lead.update({ where: { id }, data: { assigneeId } });
  }

  async updateScore(id: string, score: number) {
    return this.prisma.lead.update({ where: { id }, data: { score } });
  }

  async remove(id: string) {
    await this.prisma.lead.delete({ where: { id } });
    return { message: "Lead deleted" };
  }

  async getStats() {
    const statuses = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "WON",
      "LOST",
    ];
    const counts = await Promise.all(
      statuses.map((s) =>
        this.prisma.lead.count({ where: { status: s as any } }),
      ),
    );
    const pipeline: any = {};
    statuses.forEach((s, i) => {
      pipeline[s] = counts[i];
    });
    const total = counts.reduce((a, b) => a + b, 0);
    return { total, pipeline };
  }

  async export() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { name: true } } },
    });
  }
}
