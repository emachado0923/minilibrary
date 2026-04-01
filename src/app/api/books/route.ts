import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createBookSchema, searchBooksSchema } from '@/lib/validations'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      author: searchParams.get('author') || undefined,
      available: searchParams.get('available') === 'true' ? true : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as any) || 'title',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
    }

    const validated = searchBooksSchema.parse(params)

    const where: any = {}

    if (validated.query) {
      where.OR = [
        { title: { contains: validated.query } },
        { author: { contains: validated.query } },
        { isbn: { contains: validated.query } },
        { description: { contains: validated.query } },
      ]
    }

    if (validated.category) {
      where.category = validated.category
    }

    if (validated.author) {
      where.author = { contains: validated.author }
    }

    if (validated.available) {
      where.copiesAvailable = { gt: 0 }
    }

    const [books, total] = await Promise.all([
      db.book.findMany({
        where,
        skip: (validated.page - 1) * validated.limit,
        take: validated.limit,
        orderBy: { [validated.sortBy]: validated.sortOrder },
      }),
      db.book.count({ where }),
    ])

    return NextResponse.json({
      books,
      pagination: {
        page: validated.page,
        limit: validated.limit,
        total,
        totalPages: Math.ceil(total / validated.limit),
      },
    })
  } catch (error) {
    console.error('GET /api/books error:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.LIBRARIAN && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createBookSchema.parse(body)

    const existingBook = await db.book.findUnique({
      where: { isbn: validated.isbn },
    })

    if (existingBook) {
      return NextResponse.json({ error: 'Book with this ISBN already exists' }, { status: 400 })
    }

    const book = await db.book.create({
      data: {
        ...validated,
        copiesAvailable: validated.copiesTotal,
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('POST /api/books error:', error)
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
