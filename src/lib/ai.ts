import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateBookRecommendations(
  userHistory: Array<{ title: string; author: string; category: string }>,
  availableBooks: Array<{ id: string; title: string; author: string; category: string; description?: string | null }>
) {
  try {
    const prompt = `Based on the user's reading history:
${userHistory.map((book, i) => `${i + 1}. "${book.title}" by ${book.author} (${book.category})`).join('\n')}

Recommend 5 books from this list and explain why each would be a good match:
${availableBooks.map((book, i) => `${i + 1}. "${book.title}" by ${book.author} (${book.category})`).join('\n')}

Return a JSON array with this structure:
[
  {
    "bookIndex": 0,
    "score": 0.95,
    "reason": "Brief explanation why this book matches the user's interests"
  }
]

Only return the JSON array, no other text.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a librarian AI that provides personalized book recommendations based on reading history.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    const recommendations = JSON.parse(content)
    return recommendations.map((rec: any) => ({
      bookId: availableBooks[rec.bookIndex]?.id,
      score: rec.score,
      reason: rec.reason,
    }))
  } catch (error) {
    console.error('AI recommendation error:', error)
    return []
  }
}

export async function fetchBookMetadata(isbn: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${
        process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : ''
      }`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    const book = data.items?.[0]?.volumeInfo
    
    if (!book) return null
    
    return {
      title: book.title,
      author: book.authors?.[0] || 'Unknown',
      publisher: book.publisher,
      publishYear: book.publishedDate ? parseInt(book.publishedDate.substring(0, 4)) : undefined,
      description: book.description,
      coverUrl: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail,
      category: book.categories?.[0] || 'General',
    }
  } catch (error) {
    console.error('Google Books API error:', error)
    return null
  }
}
