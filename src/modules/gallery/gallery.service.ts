import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  private handleDbError(error: any, action: string) {
    const message = error?.message || "";
    if (
      message.includes("does not exist in the current database") ||
      (message.includes("relation") && message.includes("does not exist"))
    ) {
      throw new InternalServerErrorException(
        `Database table for gallery is not ready. Please run 'npx prisma migrate dev' in the backend directory.`,
      );
    }
    if (message.includes("Unique constraint failed")) {
      throw new BadRequestException(
        `A gallery image with this data already exists.`,
      );
    }
    throw new InternalServerErrorException(`Failed to ${action}: ${message}`);
  }

  async findAll(query: PaginationDto & { category?: string; status?: string }) {
    try {
      const { page: _p = 1, limit: _l = 20, search, category, status } = query;
      const page = Number(_p);
      const limit = Number(_l);
      const skip = (page - 1) * limit;
      const where: any = {};
      if (search) where.title = { contains: search, mode: "insensitive" };
      if (category) where.category = category;
      if (status) where.status = status;
      const [data, total] = await Promise.all([
        this.prisma.galleryImage.findMany({
          where,
          skip,
          take: limit,
          orderBy: { order: "asc" },
        }),
        this.prisma.galleryImage.count({ where }),
      ]);
      return new PaginatedResult(data, total, page, limit);
    } catch (error) {
      this.handleDbError(error, "fetch gallery images");
    }
  }

  async findPublished(query: PaginationDto & { category?: string }) {
    try {
      const { page: _p = 1, limit: _l = 20, category } = query;
      const page = Number(_p);
      const limit = Number(_l);
      const skip = (page - 1) * limit;
      const where: any = { status: "PUBLISHED" };
      if (category) where.category = category;
      const [data, total] = await Promise.all([
        this.prisma.galleryImage.findMany({
          where,
          skip,
          take: limit,
          orderBy: { order: "asc" },
        }),
        this.prisma.galleryImage.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      this.handleDbError(error, "fetch published gallery images");
    }
  }

  async findCategories() {
    try {
      const items = await this.prisma.galleryImage.findMany({
        where: { status: "PUBLISHED" },
        select: { category: true },
        distinct: ["category"],
      });
      return items.map((i: any) => i.category).filter(Boolean);
    } catch (error) {
      this.handleDbError(error, "fetch gallery categories");
    }
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.galleryImage.findUnique({ where: { id } });
      if (!item) throw new NotFoundException("Gallery image not found");
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error, "find gallery image");
    }
  }

  async create(data: any) {
    try {
      return await this.prisma.galleryImage.create({ data });
    } catch (error) {
      this.handleDbError(error, "create gallery image");
    }
  }

  async update(id: string, data: any) {
    try {
      await this.findOne(id);
      return await this.prisma.galleryImage.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error, "update gallery image");
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.prisma.galleryImage.delete({ where: { id } });
      return { message: "Gallery image deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbError(error, "delete gallery image");
    }
  }
}
