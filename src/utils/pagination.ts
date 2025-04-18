import { sql, SQL, SQLWrapper } from 'drizzle-orm';

import { db } from '@/config/database';

type Pagination = {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

type PaginationResult<T> = {
  data: T[];
  pagination: Pagination;
};

export type PaginatedQuery<T> = {
  limit(limit: number): PaginatedQuery<T>;
  offset(offset: number): PaginatedQuery<T>;
  as(alias: string): SQL;
} & SQLWrapper;

// 分頁查詢函式
export async function paginateQuery<RowType>(
  baseQuery: PaginatedQuery<RowType>,
  currentPage = 1,
  perPage = 10,
): Promise<PaginationResult<RowType>> {
  const offset = (currentPage - 1) * perPage;

  // 設置子查詢的別名
  const countQuery = baseQuery.as('count_query');
  const totalItemsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(countQuery);
  const totalItems = Number(totalItemsResult[0]?.count ?? 0);
  const totalPages = Math.ceil(totalItems / perPage);

  // 查詢具體數據
  const data = (await baseQuery.limit(perPage).offset(offset)) as unknown as RowType[];

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
