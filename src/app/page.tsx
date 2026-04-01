import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Library, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'

async function getStats() {
  const [totalBooks, availableBooks, activeLoans, totalUsers] = await Promise.all([
    db.book.count(),
    db.book.count({ where: { copiesAvailable: { gt: 0 } } }),
    db.transaction.count({ where: { status: 'ACTIVE' } }),
    db.user.count(),
  ])

  return { totalBooks, availableBooks, activeLoans, totalUsers }
}

async function getFeaturedBooks() {
  return db.book.findMany({
    where: { copiesAvailable: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export default async function Home() {
  const stats = await getStats()
  const featuredBooks = await getFeaturedBooks()

  return (
    <div>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to the Library</h1>
          <p className="text-muted-foreground">Discover, borrow, and explore our collection</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableBooks}</div>
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
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Featured Books</CardTitle>
            <CardDescription>Recently added to our collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{book.category}</p>
                      <p className="text-sm">
                        {book.copiesAvailable} of {book.copiesTotal} available
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/books" className={buttonVariants()}>Browse All Books</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
