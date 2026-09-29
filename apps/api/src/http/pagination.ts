import type { Page } from "@support-desk/shared";

export const PAGE_SIZE = 20;

export type PageRange = {
  limit: number;
  offset: number;
};

export function pageRange(page: number, pageSize = PAGE_SIZE): PageRange {
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

type BuildPageInput<Item> = {
  items: Item[];
  page: number;
  totalItems: number;
  pageSize?: number;
};

export function buildPage<Item>({
  items,
  page,
  totalItems,
  pageSize = PAGE_SIZE,
}: BuildPageInput<Item>): Page<Item> {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return { items, page, pageSize, totalItems, totalPages };
}
