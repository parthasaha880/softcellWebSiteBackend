import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 10) {
    if (!query || query.length < 2) return { results: [] };

    const [pages, posts, services, products, caseStudies, faqItems] = await Promise.all([
      this.prisma.page.findMany({ where: { status: 'PUBLISHED', OR: [{ title: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] }, select: { id: true, title: true, slug: true }, take: limit }),
      this.prisma.blogPost.findMany({ where: { status: 'PUBLISHED', OR: [{ title: { contains: query, mode: 'insensitive' } }, { excerpt: { contains: query, mode: 'insensitive' } }] }, select: { id: true, title: true, slug: true }, take: limit }),
      this.prisma.service.findMany({ where: { status: 'PUBLISHED', OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] }, select: { id: true, name: true, slug: true }, take: limit }),
      this.prisma.product.findMany({ where: { status: 'PUBLISHED', OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] }, select: { id: true, name: true, slug: true }, take: limit }),
      this.prisma.caseStudy.findMany({ where: { status: 'PUBLISHED', OR: [{ title: { contains: query, mode: 'insensitive' } }, { clientName: { contains: query, mode: 'insensitive' } }] }, select: { id: true, title: true, slug: true }, take: limit }),
      this.prisma.faqItem.findMany({ where: { status: 'PUBLISHED', OR: [{ question: { contains: query, mode: 'insensitive' } }, { answer: { contains: query, mode: 'insensitive' } }] }, select: { id: true, question: true }, take: limit }),
    ]);

    return {
      results: [
        ...pages.map(p => ({ type: 'page', id: p.id, title: p.title, url: `/${p.slug}` })),
        ...posts.map(p => ({ type: 'blog', id: p.id, title: p.title, url: `/blog/${p.slug}` })),
        ...services.map(s => ({ type: 'service', id: s.id, title: s.name, url: `/services/${s.slug}` })),
        ...products.map(p => ({ type: 'product', id: p.id, title: p.name, url: `/products/${p.slug}` })),
        ...caseStudies.map(c => ({ type: 'case-study', id: c.id, title: c.title, url: `/case-studies/${c.slug}` })),
        ...faqItems.map(f => ({ type: 'faq', id: f.id, title: f.question, url: '/faq' })),
      ],
    };
  }
}
