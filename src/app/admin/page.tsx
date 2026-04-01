import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { BookOpen, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { BooksTable } from '@/components/books/books-table'

async function getAdminStats() {
  const [totalBooks, totalUsers, activeLoans, overdueLoans] = await Promise.all([
    db.book.count(),
    db.user.count(),
    db.transaction.count({ where: { status: 'ACTIVE' } }),
    db.transaction.count({ where: { status: 'OVERDUE' } }),
  ])

  return { totalBooks, totalUsers, activeLoans, overdueLoans }
}

async function getRecentTransactions() {
  return db.transaction.findMany({
    include: {
      book: true,
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

async function getRecentBooks() {
  return db.book.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
}

export default async function AdminPage() {
  const session = await getSession()

  if (!session?.user || (session.user.role !== 'LIBRARIAN' && session.user.role !== 'ADMIN')) {
    redirect('/')
  }

  const isAdmin = session.user.role === 'ADMIN'

  const stats = await getAdminStats()
  const recentTransactions = await getRecentTransactions()
  const recentBooks = await getRecentBooks()
  const allBooks = await db.book.findMany({
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
    <div>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage books, transactions, and users</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdueLoans}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Books</CardTitle>
                  <CardDescription>Latest additions to the catalog</CardDescription>
                </div>
                {isAdmin && (
                  <Link href="/admin/books/new" className={buttonVariants({ size: 'sm' })}>Agregar Libro</Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{book.title}</p>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <Badge variant={book.copiesAvailable > 0 ? 'default' : 'secondary'}>
                      {book.copiesAvailable}/{book.copiesTotal}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/books" className={buttonVariants({ variant: 'outline', className: 'w-full justify-start' })}>View All Books</Link>
              <Link href="/my-loans" className={buttonVariants({ variant: 'outline', className: 'w-full justify-start' })}>View All Loans</Link>
              <Link href="/assistant" className={buttonVariants({ variant: 'outline', className: 'w-full justify-start' })}>AI Assistant</Link>
              <Link href="/recommendations" className={buttonVariants({ variant: 'outline', className: 'w-full justify-start' })}>Recommendations</Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest checkout and return activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <Link href={`/books/${transaction.book.id}`} className="hover:underline">
                        {transaction.book.title}
                      </Link>
                    </TableCell>
                    <TableCell>{transaction.user.name || transaction.user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(transaction.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === 'ACTIVE'
                            ? 'default'
                            : transaction.status === 'OVERDUE'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Libros</CardTitle>
                <CardDescription>
                  {isAdmin
                    ? 'Ver, crear, editar y eliminar libros del catálogo'
                    : 'Ver todos los libros del catálogo'}
                </CardDescription>
              </div>
              {isAdmin && (
                <Link href="/admin/books/new" className={buttonVariants({ variant: 'default' })}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Agregar Libro
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <BooksTable
              books={allBooks}
              showActions={isAdmin}
              userRole={session.user.role}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
