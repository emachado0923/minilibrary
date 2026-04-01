import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Intent detection - parses user message to determine what they want
function detectIntent(message: string): { intent: string; params: Record<string, string> } {
  const lower = message.toLowerCase()

  // Book summary/description
  if (lower.includes('summary') || lower.includes('about') || lower.includes('describe') || lower.includes('what is') || lower.includes('tell me about') || lower.includes('resumen') || lower.includes('trata')) {
    const titleMatch = message.match(/[""]([^""]+)[""]/i) || message.match(/(?:about|de)\s+(.+?)(?:\?|$)/i)
    return { intent: 'book_summary', params: { query: titleMatch?.[1] || message } }
  }

  // Check book availability
  if (lower.includes('disponible') || lower.includes('available') || lower.includes('hay') || lower.includes('tienen')) {
    const titleMatch = message.match(/[""]([^""]+)[""]/i) || message.match(/(?:libro|book|de)\s+(.+?)(?:\?|$)/i)
    return { intent: 'check_availability', params: { query: titleMatch?.[1] || message } }
  }

  // Loan due dates
  if (lower.includes('vence') || lower.includes('due') || lower.includes('préstamo') || lower.includes('loan') || lower.includes('devolución') || lower.includes('return')) {
    return { intent: 'check_loans', params: { query: message } }
  }

  // Search by author
  if (lower.includes('autor') || lower.includes('author') || lower.includes('escrit') || lower.includes('wrote') || lower.includes('libros de') || lower.includes('books by')) {
    const authorMatch = message.match(/(?:de|by|autor|author)\s+(.+?)(?:\?|$)/i)
    return { intent: 'search_author', params: { author: authorMatch?.[1]?.trim() || message } }
  }

  // Search by category/genre
  if (lower.includes('género') || lower.includes('genre') || lower.includes('categoría') || lower.includes('category') || lower.includes('tipo') || lower.includes('fiction') || lower.includes('fantasy') || lower.includes('science') || lower.includes('mystery') || lower.includes('thriller') || lower.includes('romance') || lower.includes('horror') || lower.includes('aventura') || lower.includes('adventure')) {
    return { intent: 'search_category', params: { query: message } }
  }

  // Statistics
  if (lower.includes('cuántos') || lower.includes('how many') || lower.includes('estadística') || lower.includes('stats') || lower.includes('total')) {
    return { intent: 'stats', params: {} }
  }

  // Overdue books
  if (lower.includes('vencido') || lower.includes('overdue') || lower.includes('atrasado') || lower.includes('late') || lower.includes('mora')) {
    return { intent: 'overdue', params: {} }
  }

  // Recommendations
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('recomend') || lower.includes('sugerir') || lower.includes('what should i read') || lower.includes('qué debería leer')) {
    return { intent: 'recommend', params: { query: message } }
  }

  // Popular / most borrowed
  if (lower.includes('popular') || lower.includes('más prestado') || lower.includes('most borrowed') || lower.includes('trending')) {
    return { intent: 'popular', params: {} }
  }

  // General search
  return { intent: 'search', params: { query: message } }
}

// Execute database queries based on intent
async function executeQuery(intent: string, params: Record<string, string>): Promise<string> {
  switch (intent) {
    case 'book_summary': {
      const books = await db.book.findMany({
        where: {
          OR: [
            { title: { contains: params.query } },
            { author: { contains: params.query } },
          ],
        },
        take: 3,
      })

      if (books.length === 0) {
        return `🔍 No books found matching "${params.query}". Try searching by title or author.`
      }

      const results = books.map((b: any) => {
        const desc = b.description || 'No description available for this book.'
        const status = b.copiesAvailable > 0 ? '✅ Available' : '❌ Currently unavailable'
        return `📖 **${b.title}** by ${b.author}\n   📂 Category: ${b.category} | Published: ${b.publishYear || 'N/A'}\n   ${status} (${b.copiesAvailable}/${b.copiesTotal} copies)\n   📝 ${desc}`
      }).join('\n\n')

      return `Found ${books.length} book(s):\n\n${results}`
    }

    case 'check_availability': {
      const books = await db.book.findMany({
        where: {
          OR: [
            { title: { contains: params.query } },
            { author: { contains: params.query } },
            { isbn: { contains: params.query } },
          ],
        },
        take: 5,
      })

      if (books.length === 0) {
        return `🔍 No books found matching "${params.query}". Could you be more specific with the title or author?`
      }

      const results = books.map((b: any) => {
        const status = b.copiesAvailable > 0
          ? `✅ **Available** (${b.copiesAvailable}/${b.copiesTotal} copies)`
          : `❌ **Unavailable** (all ${b.copiesTotal} copies borrowed)`
        return `📖 **${b.title}** by ${b.author}\n   ${status}`
      }).join('\n\n')

      return `Found ${books.length} result(s):\n\n${results}`
    }

    case 'check_loans': {
      const activeLoans = await db.transaction.findMany({
        where: { status: 'ACTIVE' },
        include: { book: true, user: { select: { name: true, email: true } } },
        take: 10,
        orderBy: { dueDate: 'asc' },
      })

      if (activeLoans.length === 0) {
        return '📋 No active loans at the moment.'
      }

      const results = activeLoans.map((t: any) => {
        const due = new Date(t.dueDate)
        const now = new Date()
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const urgency = daysLeft < 0 ? '🔴 OVERDUE' : daysLeft <= 3 ? '🟡 Due soon' : '🟢 On time'
        return `${urgency} **${t.book.title}** → ${t.user.name || t.user.email}\n   📅 Due: ${due.toLocaleDateString()} (${daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days late`})`
      }).join('\n\n')

      return `📋 **Active Loans** (${activeLoans.length}):\n\n${results}`
    }

    case 'search_author': {
      const books = await db.book.findMany({
        where: { author: { contains: params.author } },
        orderBy: { title: 'asc' },
      })

      if (books.length === 0) {
        return `🔍 No books found by author "${params.author}". Check the name or try part of the last name.`
      }

      const results = books.map((b: any) => {
        const avail = b.copiesAvailable > 0 ? '✅' : '❌'
        return `${avail} **${b.title}** (${b.publishYear || 'N/A'}) — ${b.category} — ${b.copiesAvailable}/${b.copiesTotal} available`
      }).join('\n')

      return `📚 **Books by ${books[0].author}** (${books.length} found):\n\n${results}`
    }

    case 'search_category': {
      const categories = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Science', 'Technology', 'Self-Help', 'Business', 'Philosophy', 'Poetry', 'Drama', 'Adventure']
      const query = params.query.toLowerCase()
      const matchedCategory = categories.find(c => query.includes(c.toLowerCase()))

      if (!matchedCategory) {
        const allCats = await db.book.groupBy({
          by: ['category'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        })
        const catList = allCats.map((c: any) => `• **${c.category}** (${c._count.id} books)`).join('\n')
        return `📂 **Available Categories:**\n\n${catList}\n\nWhich category interests you?`
      }

      const books = await db.book.findMany({
        where: { category: matchedCategory, copiesAvailable: { gt: 0 } },
        take: 8,
        orderBy: { title: 'asc' },
      })

      if (books.length === 0) {
        return `📂 No books available in the **${matchedCategory}** category at the moment.`
      }

      const results = books.map((b: any) =>
        `📖 **${b.title}** by ${b.author} (${b.copiesAvailable} available)`
      ).join('\n')

      return `📂 **Available ${matchedCategory} Books** (${books.length}):\n\n${results}`
    }

    case 'stats': {
      const [totalBooks, totalUsers, activeLoans, overdueLoans, totalCopies, availableCopies] = await Promise.all([
        db.book.count(),
        db.user.count(),
        db.transaction.count({ where: { status: 'ACTIVE' } }),
        db.transaction.count({ where: { status: 'OVERDUE' } }),
        db.book.aggregate({ _sum: { copiesTotal: true } }),
        db.book.aggregate({ _sum: { copiesAvailable: true } }),
      ])

      const categories = await db.book.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      })

      const topCats = categories.map((c: any) => `  • ${c.category}: ${c._count.id}`).join('\n')

      return `📊 **Library Statistics:**\n\n` +
        `📚 **Unique Titles:** ${totalBooks}\n` +
        `📦 **Total Copies:** ${totalCopies._sum.copiesTotal || 0}\n` +
        `✅ **Available Copies:** ${availableCopies._sum.copiesAvailable || 0}\n` +
        `👥 **Registered Users:** ${totalUsers}\n` +
        `📋 **Active Loans:** ${activeLoans}\n` +
        `🔴 **Overdue Loans:** ${overdueLoans}\n\n` +
        `📂 **Top Categories:**\n${topCats}`
    }

    case 'overdue': {
      const overdue = await db.transaction.findMany({
        where: { status: 'OVERDUE' },
        include: { book: true, user: { select: { name: true, email: true } } },
        orderBy: { dueDate: 'asc' },
      })

      if (overdue.length === 0) {
        return '🎉 No overdue loans! Everything is up to date.'
      }

      const results = overdue.map((t: any) => {
        const due = new Date(t.dueDate)
        const daysLate = Math.ceil((new Date().getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
        return `🔴 **${t.book.title}** → ${t.user.name || t.user.email}\n   Due: ${due.toLocaleDateString()} (${daysLate} days late)`
      }).join('\n\n')

      return `⚠️ **Overdue Loans** (${overdue.length}):\n\n${results}\n\n💡 **Suggested Action:** Send return reminder to affected users.`
    }

    case 'recommend': {
      // Get available books from diverse categories
      const categories = await db.book.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      })

      const recommendations = []
      for (const cat of categories) {
        const books = await db.book.findMany({
          where: { 
            category: cat.category,
            copiesAvailable: { gt: 0 }
          },
          take: 2,
          orderBy: { title: 'asc' },
        })
        recommendations.push(...books)
      }

      if (recommendations.length === 0) {
        return `📚 No available books to recommend at the moment. Check back soon!`
      }

      const results = recommendations.slice(0, 8).map((b: any, i: number) => {
        const desc = b.description ? b.description.substring(0, 100) + '...' : 'A great read!'
        return `${i + 1}. **${b.title}** by ${b.author}\n   📂 ${b.category} | ${b.copiesAvailable} available\n   💡 ${desc}`
      }).join('\n\n')

      return `📚 **Recommended Books for You:**\n\n${results}\n\n✨ These books are currently available and span different genres!`
    }

    case 'popular': {
      const popular = await db.book.findMany({
        where: { copiesAvailable: { lt: db.book.fields?.copiesTotal } },
        orderBy: { copiesAvailable: 'asc' },
        take: 10,
      })

      // fallback: books with fewer available copies = more borrowed
      const books = await db.book.findMany({
        orderBy: { copiesAvailable: 'asc' },
        take: 10,
      })

      const results = books.map((b: any, i: number) => {
        const borrowed = b.copiesTotal - b.copiesAvailable
        return `${i + 1}. **${b.title}** by ${b.author}\n   📊 ${borrowed}/${b.copiesTotal} borrowed | Category: ${b.category}`
      }).join('\n\n')

      return `🔥 **Most Popular Books:**\n\n${results}\n\n💡 These books might need more copies.`
    }

    case 'search':
    default: {
      const books = await db.book.findMany({
        where: {
          OR: [
            { title: { contains: params.query } },
            { author: { contains: params.query } },
            { description: { contains: params.query } },
            { category: { contains: params.query } },
          ],
        },
        take: 5,
      })

      if (books.length === 0) {
        return `🤔 No results found for "${params.query}".\n\nI can help you with:\n• 📖 Search books by title or author\n• ✅ Check availability\n• 📋 View active and overdue loans\n• 📊 Library statistics\n• 📂 Explore categories\n• 🔥 See most popular books\n• 💡 Get book recommendations\n• 📝 Book summaries and descriptions\n\nWhat do you need?`
      }

      const results = books.map((b: any) => {
        const avail = b.copiesAvailable > 0 ? '✅' : '❌'
        return `${avail} **${b.title}** by ${b.author} (${b.category}) — ${b.copiesAvailable}/${b.copiesTotal}`
      }).join('\n')

      return `🔍 **Results for "${params.query}":**\n\n${results}`
    }
  }
}

// Get library context from database for the AI
async function getLibraryContext(userMessage: string): Promise<string> {
  const { intent, params } = detectIntent(userMessage)
  const dbResult = await executeQuery(intent, params)
  
  // Get quick stats
  const [totalBooks, totalUsers, activeLoans, overdueLoans] = await Promise.all([
    db.book.count(),
    db.user.count(),
    db.transaction.count({ where: { status: 'ACTIVE' } }),
    db.transaction.count({ where: { status: 'OVERDUE' } }),
  ])

  return `LIBRARY CONTEXT (real-time database data):
- Total books: ${totalBooks}
- Registered users: ${totalUsers}
- Active loans: ${activeLoans}
- Overdue loans: ${overdueLoans}

DATABASE QUERY RESULT for the user's question:
${dbResult}`
}

async function callOpenRouter(messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-plus-preview:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  const result = await response.json()
  
  if (!response.ok) {
    console.error('OpenRouter error:', result)
    throw new Error(result.error?.message || 'OpenRouter API error')
  }

  return result.choices?.[0]?.message?.content || 'Could not generate a response.'
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as { messages: Message[] }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 })
    }

    // Get database context based on the user's question
    const dbContext = await getLibraryContext(lastMessage.content)
    const { intent } = detectIntent(lastMessage.content)

    const systemPrompt = `You are the LibraryOS Virtual Assistant, a library management system AI.
Always respond in English. Be concise, friendly, and helpful.
Use emojis to make responses more visual and engaging.
Base your responses EXCLUSIVELY on the real database data provided to you.
DO NOT invent data. If you don't have information, say so clearly.
Format responses with markdown (bold, lists, etc).
When recommending books, highlight their unique features and why they might interest the reader.
When providing book summaries, be informative but concise.
Help users discover books they'll love based on available inventory.

${dbContext}`

    let content: string

    try {
      // Try OpenRouter AI first
      content = await callOpenRouter(messages, systemPrompt)
    } catch (aiError) {
      console.error('OpenRouter fallback:', aiError)
      // Fallback to direct DB response if AI fails
      content = await executeQuery(intent, detectIntent(lastMessage.content).params)
    }

    return NextResponse.json({
      role: 'assistant',
      content,
      intent,
    })
  } catch (error) {
    console.error('Assistant error:', error)
    return NextResponse.json(
      { error: 'Error processing request', role: 'assistant', content: '❌ An error occurred processing your query. Please try again.' },
      { status: 500 }
    )
  }
}
