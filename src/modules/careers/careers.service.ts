import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class CareersService {
  constructor(private prisma: PrismaService) {}

  async findPublished(
    query: PaginationDto & {
      department?: string;
      location?: string;
      type?: string;
    },
  ) {
    const { page = 1, limit = 20, search, department, location, type } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = { status: "OPEN" };
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (department) where.department = department;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.jobListing.findMany({
        where,
        skip,
        take,
        orderBy: { publishedAt: "desc" },
      }),
      this.prisma.jobListing.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findBySlug(slug: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { slug } });
    if (!job) throw new NotFoundException("Job not found");
    return job;
  }

  async findAll(query: PaginationDto & { status?: string }) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.jobListing.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      }),
      this.prisma.jobListing.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: { applications: { orderBy: { createdAt: "desc" } } },
    });
    if (!job) throw new NotFoundException("Job not found");
    return job;
  }

  async create(data: any) {
    return this.prisma.jobListing.create({ data });
  }
  async update(id: string, data: any) {
    return this.prisma.jobListing.update({ where: { id }, data });
  }
  async remove(id: string) {
    await this.prisma.jobListing.delete({ where: { id } });
    return { message: "Job deleted" };
  }

  // Applications
  async apply(jobId: string, data: any) {
    return this.prisma.jobApplication.create({ data: { ...data, jobId } });
  }
  async findApplications(jobId: string) {
    return this.prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    });
  }
  async updateApplication(id: string, data: any) {
    return this.prisma.jobApplication.update({ where: { id }, data });
  }

  async getDepartments() {
    const items = await this.prisma.jobListing.findMany({
      where: { status: "OPEN" },
      select: { department: true },
      distinct: ["department"],
    });
    return items.map((i) => i.department);
  }
}
