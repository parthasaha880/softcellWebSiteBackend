import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private svc: BlogService) {}

  // Public
  @Public() @Get('public/posts')
  findPublished(@Query() q: PaginationDto & { categorySlug?: string; tagSlug?: string }) { return this.svc.findPublishedPosts(q); }

  @Public() @Get('public/posts/:slug')
  findBySlug(@Param('slug') slug: string) { return this.svc.findPostBySlug(slug); }

  @Public() @Get('public/categories')
  findPublicCategories() { return this.svc.findAllCategories(); }

  @Public() @Get('public/tags')
  findPublicTags() { return this.svc.findAllTags(); }

  @Public() @Get('public/popular')
  findPopular(@Query('limit') limit?: number) { return this.svc.findPopularPosts(limit); }

  @Public() @Post('public/posts/:postId/comments')
  createComment(@Param('postId') postId: string, @Body() data: any) { return this.svc.createComment(postId, data); }

  // Admin - Posts
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Get('posts') findAllPosts(@Query() q: PaginationDto & { status?: string; categoryId?: string }) { return this.svc.findAllPosts(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Get('posts/:id') findPost(@Param('id') id: string) { return this.svc.findPost(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Post('posts') createPost(@Body() data: any, @CurrentUser('id') userId: string) { return this.svc.createPost(data, userId); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Put('posts/:id') updatePost(@Param('id') id: string, @Body() data: any) { return this.svc.updatePost(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete('posts/:id') deletePost(@Param('id') id: string) { return this.svc.deletePost(id); }

  // Admin - Categories
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Get('categories') findCategories() { return this.svc.findAllCategories(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Post('categories') createCategory(@Body() data: any) { return this.svc.createCategory(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Put('categories/:id') updateCategory(@Param('id') id: string, @Body() data: any) { return this.svc.updateCategory(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete('categories/:id') deleteCategory(@Param('id') id: string) { return this.svc.deleteCategory(id); }

  // Admin - Tags
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Get('tags') findTags() { return this.svc.findAllTags(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Post('tags') createTag(@Body() data: any) { return this.svc.createTag(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Put('tags/:id') updateTag(@Param('id') id: string, @Body() data: any) { return this.svc.updateTag(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete('tags/:id') deleteTag(@Param('id') id: string) { return this.svc.deleteTag(id); }

  // Admin - Comments
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('comments/pending') findPendingComments() { return this.svc.findPendingComments(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Patch('comments/:id/approve') approveComment(@Param('id') id: string) { return this.svc.approveComment(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete('comments/:id') deleteComment(@Param('id') id: string) { return this.svc.deleteComment(id); }
}
