import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Calendar, User } from 'lucide-react'

export default async function CheckoutBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await db.book.findUnique({
    where: { id },
  })

  if (!book) {
    notFound()
  }

  if (book.copiesAvailable === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Book Unavailable</CardTitle>
            <CardDescription>This book is currently unavailable for checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Book</p>
                <p className="font-medium text-lg">{book.title}</p>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-destructive">All {book.copiesTotal} copies are currently borrowed</p>
              </div>
              <Link href={`/books/${book.id}`}>
                <Button variant="outline" className="w-full">Back to Book Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function handleCheckout() {
    'use server'
    
    const session = await auth()
    if (!session?.user?.id) {
      redirect('/login')
    }
    
    const userId = session.user.id
    
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 days loan period

    await db.$transaction([
      db.transaction.create({
        data: {
          userId,
          bookId: id,
          type: 'CHECKOUT',
          checkoutDate: new Date(),
          dueDate,
          status: 'ACTIVE',
        },
      }),
      db.book.update({
        where: { id },
        data: {
          copiesAvailable: { decrement: 1 },
        },
      }),
    ])

    redirect('/my-loans')
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout Book</CardTitle>
          <CardDescription>Confirm book checkout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <BookOpen className="h-12 w-12 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Book</p>
                <p className="font-medium text-lg">{book.title}</p>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{book.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Copies</p>
                <p className="font-medium">{book.copiesAvailable} of {book.copiesTotal}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loan Period</p>
              </div>
              <p className="font-medium">14 days</p>
              <p className="text-sm text-muted-foreground mt-1">
                Due date: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>

            <form action={handleCheckout} className="space-y-4 pt-4">
              <Button type="submit" className="w-full" size="lg">
                Confirm Checkout
              </Button>
              <Link href={`/books/${book.id}`}>
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
