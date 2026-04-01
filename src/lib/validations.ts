import { z } from 'zod'

export const bookSchema = z.object({
  isbn: z.string().min(10).max(13),
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(300),
  publisher: z.string().max(300).optional(),
  publishYear: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
  category: z.string().min(1).max(100),
  copiesTotal: z.number().int().min(1),
  copiesAvailable: z.number().int().min(0),
  coverUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
})

export const createBookSchema = bookSchema.omit({ copiesAvailable: true })

export const updateBookSchema = bookSchema.partial().extend({
  id: z.string(),
})

export const checkoutSchema = z.object({
  bookId: z.string(),
  dueDate: z.string().datetime().or(z.date()),
})

export const returnBookSchema = z.object({
  transactionId: z.string(),
  notes: z.string().optional(),
})

export const searchBooksSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  available: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['title', 'author', 'publishYear', 'createdAt']).default('title'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type BookInput = z.infer<typeof bookSchema>
export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReturnBookInput = z.infer<typeof returnBookSchema>
export type SearchBooksInput = z.infer<typeof searchBooksSchema>
