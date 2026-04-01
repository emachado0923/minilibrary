import { NextRequest, NextResponse } from 'next/server'
import { fetchBookMetadata } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isbn = searchParams.get('isbn')

    if (!isbn) {
      return NextResponse.json({ error: 'ISBN is required' }, { status: 400 })
    }

    const metadata = await fetchBookMetadata(isbn)

    if (!metadata) {
      return NextResponse.json({ error: 'Book metadata not found' }, { status: 404 })
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('GET /api/books/metadata error:', error)
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}
