import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Calendar, User, Building } from 'lucide-react'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  const book = await db.book.findUnique({
    where: { id },
    include: {
      transactions: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!book) {
    notFound()
  }

  return (
    <div>
      <div className="container mx-auto">
        <div className="mb-4">
          <Link href="/books" className={buttonVariants({ variant: 'ghost' })}>← Back to Catalog</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
                    <CardDescription className="text-lg">{book.author}</CardDescription>
                  </div>
                  <Badge variant={book.copiesAvailable > 0 ? 'default' : 'secondary'} className="text-sm">
                    {book.copiesAvailable > 0 ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {book.coverUrl && book.coverUrl.trim() !== '' && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>ISBN:</strong> {book.isbn || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Category:</strong> {book.category || 'N/A'}
                    </span>
                  </div>
                  {book.publisher && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Publisher:</strong> {book.publisher}
                      </span>
                    </div>
                  )}
                  {book.publishYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Year:</strong> {book.publishYear}
                      </span>
                    </div>
                  )}
                </div>

                {book.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{book.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{book.copiesAvailable}</p>
                  <p className="text-sm text-muted-foreground">
                    of {book.copiesTotal} copies available
                  </p>
                </div>
                {book.copiesAvailable > 0 && (
                  <Link href={`/books/${book.id}/checkout`} className={buttonVariants({ className: 'w-full' })}>Borrow This Book</Link>
                )}
              </CardContent>
            </Card>

            {book.transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {book.transactions.map((transaction) => (
                      <div key={transaction.id} className="text-sm border-b pb-2 last:border-0">
                        <p className="font-medium">{transaction.user.name || transaction.user.email || 'Unknown User'}</p>
                        <p className="text-muted-foreground">
                          {transaction.status === 'ACTIVE' ? 'Borrowed' : 'Returned'} on{' '}
                          {transaction.checkoutDate ? new Date(transaction.checkoutDate).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
