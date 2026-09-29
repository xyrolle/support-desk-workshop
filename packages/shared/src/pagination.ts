import { z } from "zod";

export const pageInfoSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(1),
});

export type PageInfo = z.infer<typeof pageInfoSchema>;

export type Page<Item> = PageInfo & { items: Item[] };

export function pageSchema<ItemSchema extends z.ZodType>(itemSchema: ItemSchema) {
  return pageInfoSchema.extend({ items: z.array(itemSchema) });
}
