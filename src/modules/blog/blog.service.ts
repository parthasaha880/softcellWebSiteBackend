import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAllPosts(query: PaginationDto & { status?: string; categoryId?: string }) {
    const { page: _p = 1, limit: _l = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, categoryId } = query;
    const page = Number(_p); const limit = Number(_l);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }];
    if (status) where.status = status;
    if (categoryId) where.categories = { some: { categoryId } };

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: { author: { select: { id: true, name: true, avatar: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findPublishedPosts(query: PaginationDto & { categorySlug?: string; tagSlug?: string }) {
    const { page: _p = 1, limit: _l = 20, search, categorySlug, tagSlug } = query;
    const page = Number(_p); const limit = Number(_l);
    const skip = (page - 1) * limit;
    const where: any = { status: 'PUBLISHED' };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }];
    if (categorySlug) where.categories = { some: { category: { slug: categorySlug } } };
    if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where, skip, take: limit, orderBy: { publishedAt: 'desc' },
        include: { author: { select: { id: true, name: true, avatar: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        comments: { where: { isApproved: true, parentId: null }, include: { replies: { where: { isApproved: true } }, user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.prisma.blogPost.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
    return post;
  }

  async findPost(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(data: any, userId?: string) {
    const { categoryIds, tagIds, ...postData } = data;
    return this.prisma.blogPost.create({
      data: {
        ...postData, authorId: userId,
        readTime: Math.ceil((postData.content?.length || 0) / 1500),
        categories: categoryIds?.length ? { create: categoryIds.map((id: string) => ({ categoryId: id })) } : undefined,
        tags: tagIds?.length ? { create: tagIds.map((id: string) => ({ tagId: id })) } : undefined,
      },
      include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
    });
  }

  async updatePost(id: string, data: any) {
    await this.findPost(id);
    const { categoryIds, tagIds, ...postData } = data;
    if (categoryIds) {
      await this.prisma.blogPostCategory.deleteMany({ where: { postId: id } });
      if (categoryIds.length) await this.prisma.blogPostCategory.createMany({ data: categoryIds.map((cid: string) => ({ postId: id, categoryId: cid })) });
    }
    if (tagIds) {
      await this.prisma.blogPostTag.deleteMany({ where: { postId: id } });
      if (tagIds.length) await this.prisma.blogPostTag.createMany({ data: tagIds.map((tid: string) => ({ postId: id, tagId: tid })) });
    }
    return this.prisma.blogPost.update({
      where: { id }, data: { ...postData, readTime: Math.ceil((postData.content?.length || 0) / 1500) },
      include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
    });
  }

  async deletePost(id: string) {
    await this.findPost(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Post deleted' };
  }

  // Categories
  async findAllCategories() { return this.prisma.blogCategory.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { posts: true } } } }); }
  async createCategory(data: any) { return this.prisma.blogCategory.create({ data }); }
  async updateCategory(id: string, data: any) { return this.prisma.blogCategory.update({ where: { id }, data }); }
  async deleteCategory(id: string) { await this.prisma.blogCategory.delete({ where: { id } }); return { message: 'Category deleted' }; }

  // Tags
  async findAllTags() { return this.prisma.blogTag.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } }); }
  async createTag(data: any) { return this.prisma.blogTag.create({ data }); }
  async updateTag(id: string, data: any) { return this.prisma.blogTag.update({ where: { id }, data }); }
  async deleteTag(id: string) { await this.prisma.blogTag.delete({ where: { id } }); return { message: 'Tag deleted' }; }

  // Comments
  async createComment(postId: string, data: any) {
    return this.prisma.comment.create({ data: { ...data, postId } });
  }
  async approveComment(id: string) { return this.prisma.comment.update({ where: { id }, data: { isApproved: true } }); }
  async deleteComment(id: string) { await this.prisma.comment.delete({ where: { id } }); return { message: 'Comment deleted' }; }
  async findPendingComments() { return this.prisma.comment.findMany({ where: { isApproved: false }, include: { post: { select: { id: true, title: true, slug: true } } }, orderBy: { createdAt: 'desc' } }); }

  // Popular posts
  async findPopularPosts(limit = 5) {
    return this.prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, take: Number(limit), include: { author: { select: { id: true, name: true } } } });
  }
}
