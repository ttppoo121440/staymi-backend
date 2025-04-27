import { PaginationResult } from '@/types/pagination';

// 分頁查詢函式
export async function paginateQuery<RowType>(
  getDataQuery: (limit: number, offset: number) => Promise<RowType[]>,
  getCountQuery: () => Promise<number>,
  currentPage = 1,
  perPage = 10,
): Promise<PaginationResult<RowType>> {
  const offset = (currentPage - 1) * perPage;

  const totalItems = await getCountQuery();
  const totalPages = Math.ceil(totalItems / perPage) || 1;

  const data = await getDataQuery(perPage, offset);

  return {
    data,
    pagination: {
      currentPage,
      perPage,
      totalPages,
      totalItems,
    },
  };
}
