import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default async function ReturnBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      book: true,
      user: {
        select: { name: true, email: true },
      },
    },
  })

  if (!transaction) {
    notFound()
  }

  const bookId = transaction.bookId
  const transactionId = id

  async function handleReturn() {
    'use server'
    
    await db.$transaction([
      db.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
        },
      }),
      db.book.update({
        where: { id: bookId },
        data: {
          copiesAvailable: { increment: 1 },
        },
      }),
    ])

    redirect('/my-loans')
  }

  if (transaction.status === 'RETURNED') {
    return (
      <div>
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <CardTitle>Book Already Returned</CardTitle>
              </div>
              <CardDescription>This book has already been returned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Book</p>
                  <p className="font-medium">{transaction.book.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Date</p>
                  <p className="font-medium">
                    {transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Link href="/my-loans">
                  <Button className="w-full">Back to My Loans</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Return Book</CardTitle>
            <CardDescription>Confirm book return</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Book</p>
                <p className="font-medium text-lg">{transaction.book.title}</p>
                <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Borrowed by</p>
                <p className="font-medium">{transaction.user.name || transaction.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checkout Date</p>
                <p className="font-medium">{new Date(transaction.checkoutDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{new Date(transaction.dueDate).toLocaleDateString()}</p>
              </div>
              
              <form action={handleReturn} className="space-y-4 pt-4">
                <Button type="submit" className="w-full" size="lg">
                  Confirm Return
                </Button>
                <Link href="/my-loans">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
