import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateBookSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const book = await db.book.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('GET /api/books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.LIBRARIAN && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateBookSchema.parse({ ...body, id: params.id })

    const existingBook = await db.book.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const activeLoans = existingBook.transactions.length
    const currentlyAvailable = existingBook.copiesTotal - activeLoans

    if (validated.copiesTotal !== undefined && validated.copiesTotal < activeLoans) {
      return NextResponse.json(
        { error: `Cannot reduce total copies below ${activeLoans} (currently on loan)` },
        { status: 400 }
      )
    }

    const { id, ...updateData } = validated

    const updatedBook = await db.book.update({
      where: { id: params.id },
      data: {
        ...updateData,
        copiesAvailable: validated.copiesTotal !== undefined 
          ? validated.copiesTotal - activeLoans 
          : undefined,
      },
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error('PATCH /api/books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.LIBRARIAN && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const book = await db.book.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    if (book.transactions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book with active loans' },
        { status: 400 }
      )
    }

    await db.book.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
