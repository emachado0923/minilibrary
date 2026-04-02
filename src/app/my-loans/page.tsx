import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { format, isPast } from 'date-fns'

export default async function MyLoansPage() {
  const session = await auth()

  // Fallback: check custom cookie session (used by email/password login)
  let userId = session?.user?.id
  if (!userId) {
    const cookieStore = await cookies()
    const raw = cookieStore.get('session-user')?.value
    if (raw) {
      try {
        const cookieUser = JSON.parse(raw)
        userId = cookieUser.id
      } catch {}
    }
  }

  if (!userId) {
    redirect('/login')
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId: userId,
      status: { in: ['ACTIVE', 'OVERDUE'] },
    },
    include: {
      book: true,
    },
    orderBy: { dueDate: 'asc' },
  })

  return (
    <div>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Loans</h1>
          <p className="text-muted-foreground">Manage your borrowed books</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
            <CardDescription>Books you currently have checked out</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You don't have any active loans.</p>
                <Link href="/books" className={buttonVariants()}>Browse Books</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const isOverdue = isPast(new Date(transaction.dueDate))
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <Link href={`/books/${transaction.book.id}`} className="hover:underline">
                            {transaction.book.title}
                          </Link>
                        </TableCell>
                        <TableCell>{transaction.book.author}</TableCell>
                        <TableCell>{format(new Date(transaction.checkoutDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {format(new Date(transaction.dueDate), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isOverdue ? 'destructive' : 'default'}>
                            {isOverdue ? 'Overdue' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/transactions/${transaction.id}/return`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>Return</Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
