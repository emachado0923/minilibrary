import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const notes = body.notes

    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
      include: { book: true },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'ACTIVE' && transaction.status !== 'OVERDUE') {
      return NextResponse.json({ error: 'Transaction is not active' }, { status: 400 })
    }

    if (session.user.role === UserRole.USER && transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [updatedTransaction] = await db.$transaction([
      db.transaction.update({
        where: { id: params.id },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
          notes,
        },
        include: {
          book: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.book.update({
        where: { id: transaction.bookId },
        data: { copiesAvailable: { increment: 1 } },
      }),
    ])

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('POST /api/transactions/[id]/return error:', error)
    return NextResponse.json({ error: 'Failed to return book' }, { status: 500 })
  }
}
