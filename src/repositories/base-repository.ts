import { PaginationResult } from '@/types/pagination';
import { paginateQuery } from '@/utils/pagination';

export class BaseRepository {
  protected async paginateQuery<RowType>(
    getDataQuery: (limit: number, offset: number) => Promise<RowType[]>,
    getCountQuery: () => Promise<number>,
    currentPage = 1,
    perPage = 10,
  ): Promise<PaginationResult<RowType>> {
    return paginateQuery(getDataQuery, getCountQuery, currentPage, perPage);
  }
}
