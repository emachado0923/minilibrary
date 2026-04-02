export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { BooksTable } from '@/components/books/books-table'

export default async function BooksPage() {
  const books = await db.book.findMany({
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      author: true,
      category: true,
      publisher: true,
      publishYear: true,
      isbn: true,
      copiesAvailable: true,
      copiesTotal: true,
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Book Catalog</h1>
        <p className="text-muted-foreground">
          Browse and search our complete collection. Use the search box to filter by any field.
        </p>
      </div>

      <BooksTable books={books} />
    </div>
  )
}
