import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next-auth'
import { db } from '@/lib/db'
import { checkoutSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: any = {}

    if (session.user.role === UserRole.USER) {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        book: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('GET /api/transactions error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = checkoutSchema.parse(body)

    const book = await db.book.findUnique({
      where: { id: validated.bookId },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    if (book.copiesAvailable <= 0) {
      return NextResponse.json({ error: 'No copies available' }, { status: 400 })
    }

    const activeLoans = await db.transaction.count({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (activeLoans >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 active loans reached' },
        { status: 400 }
      )
    }

    const [transaction] = await db.$transaction([
      db.transaction.create({
        data: {
          userId: session.user.id,
          bookId: validated.bookId,
          dueDate: new Date(validated.dueDate),
          type: 'CHECKOUT',
          status: 'ACTIVE',
        },
        include: {
          book: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.book.update({
        where: { id: validated.bookId },
        data: { copiesAvailable: { decrement: 1 } },
      }),
    ])

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('POST /api/transactions error:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
