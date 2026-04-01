import { NextRequest, NextResponse } from 'next/server'
import { auth } from 'next-auth'
import { db } from '@/lib/db'
import { generateBookRecommendations } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userTransactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        status: 'RETURNED',
      },
      include: {
        book: true,
      },
      orderBy: { returnDate: 'desc' },
      take: 10,
    })

    if (userTransactions.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'No reading history available. Check out some books first!' 
      })
    }

    const userHistory = userTransactions.map(t => ({
      title: t.book.title,
      author: t.book.author,
      category: t.book.category,
    }))

    const availableBooks = await db.book.findMany({
      where: {
        copiesAvailable: { gt: 0 },
        id: {
          notIn: userTransactions.map(t => t.bookId),
        },
      },
      take: 50,
    })

    const aiRecommendations = await generateBookRecommendations(
      userHistory,
      availableBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        description: b.description,
      }))
    )

    const validRecommendations = aiRecommendations.filter((r: any) => r.bookId)

    for (const rec of validRecommendations) {
      try {
        await db.aIRecommendation.create({
          data: {
            userId: session.user.id,
            bookId: rec.bookId,
            score: rec.score || 0.5,
            reason: rec.reason || 'AI generated recommendation',
          },
        })
      } catch (error) {
        // If it already exists, update it
        await db.aIRecommendation.updateMany({
          where: {
            userId: session.user.id,
            bookId: rec.bookId,
          },
          data: {
            score: rec.score || 0.5,
            reason: rec.reason || 'AI generated recommendation',
          },
        })
      }
    }

    const recommendations = await db.aIRecommendation.findMany({
      where: {
        userId: session.user.id,
        bookId: { in: validRecommendations.map((r: any) => r.bookId) },
      },
      include: {
        book: true,
      },
      orderBy: { score: 'desc' },
      take: 5,
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('GET /api/recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
