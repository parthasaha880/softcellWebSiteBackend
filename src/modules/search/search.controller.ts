import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private svc: SearchService) {}

  @Public() @Get()
  search(@Query('q') query: string, @Query('limit') limit?: number) { return this.svc.globalSearch(query, limit); }
}
