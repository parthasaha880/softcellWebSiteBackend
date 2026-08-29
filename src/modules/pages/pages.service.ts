import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: string }) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: { select: { id: true, name: true } },
          blocks: { orderBy: { order: "asc" } },
        },
      }),
      this.prisma.page.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findPublished() {
    return this.prisma.page.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: {
        blocks: { where: { isVisible: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        blocks: { where: { isVisible: true }, orderBy: { order: "asc" } },
      },
    });
    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        blocks: { orderBy: { order: "asc" } },
        versions: { orderBy: { version: "desc" }, take: 10 },
      },
    });
    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  async create(data: any, userId?: string) {
    const { blocks, ...pageData } = data;
    const page = await this.prisma.page.create({
      data: {
        ...pageData,
        authorId: userId,
        blocks: blocks
          ? { create: blocks.map((b: any, i: number) => ({ ...b, order: i })) }
          : undefined,
      },
      include: { blocks: true },
    });
    return page;
  }

  async update(id: string, data: any, userId?: string) {
    const existing = await this.findOne(id);

    // Save version before updating
    await this.prisma.pageVersion.create({
      data: {
        pageId: id,
        userId,
        title: (existing as any).title,
        blocks: JSON.parse(JSON.stringify((existing as any).blocks || [])),
        metadata: {
          metaTitle: (existing as any).metaTitle,
          metaDescription: (existing as any).metaDescription,
        },
        version: ((existing as any).versions?.[0]?.version || 0) + 1,
      },
    });

    const { blocks, ...pageData } = data;
    if (blocks) {
      await this.prisma.pageBlock.deleteMany({ where: { pageId: id } });
      await this.prisma.pageBlock.createMany({
        data: blocks.map((b: any, i: number) => ({
          ...b,
          pageId: id,
          order: i,
        })),
      });
    }

    return this.prisma.page.update({
      where: { id },
      data: pageData,
      include: { blocks: { orderBy: { order: "asc" } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.page.delete({ where: { id } });
    return { message: "Page deleted successfully" };
  }

  async duplicate(id: string) {
    const page = await this.findOne(id);
    const p = page as any;
    const { id: _, createdAt, updatedAt, versions, author, ...rest } = p;
    return this.prisma.page.create({
      data: {
        ...rest,
        slug: `${rest.slug}-copy-${Date.now()}`,
        title: `${rest.title} (Copy)`,
        status: "DRAFT",
        blocks: {
          create: (p.blocks || []).map((b: any) => ({
            type: b.type,
            content: b.content,
            order: b.order,
            settings: b.settings,
            isVisible: b.isVisible,
          })),
        },
      },
      include: { blocks: true },
    });
  }

  async getVersions(id: string) {
    return this.prisma.pageVersion.findMany({
      where: { pageId: id },
      orderBy: { version: "desc" },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async revertToVersion(id: string, versionId: string) {
    const version = await this.prisma.pageVersion.findUnique({
      where: { id: versionId },
    });
    if (!version) throw new NotFoundException("Version not found");

    await this.prisma.pageBlock.deleteMany({ where: { pageId: id } });
    const blocks = version.blocks as any[];
    if (blocks?.length) {
      await this.prisma.pageBlock.createMany({
        data: blocks.map((b: any) => ({ ...b, pageId: id, id: undefined })),
      });
    }

    return this.prisma.page.update({
      where: { id },
      data: { title: version.title },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
  }
}
