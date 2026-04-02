export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default async function RecommendationsPage() {
  const recommendations = await db.aIRecommendation.findMany({
    include: {
      book: true,
    },
    orderBy: { score: 'desc' },
    take: 10,
  })

  return (
    <div>
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Recommendations</h1>
          </div>
          <p className="text-muted-foreground">Personalized book suggestions based on your reading history</p>
        </div>

        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start borrowing books to get personalized AI-powered recommendations!
              </p>
              <Link href="/books" className={buttonVariants()}>Browse Books</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{rec.book.title}</CardTitle>
                      <CardDescription>{rec.book.author}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {Math.round(rec.score * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Why we recommend this:</p>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">{rec.book.category}</span>
                      {rec.book.publishYear && (
                        <span className="text-muted-foreground"> • {rec.book.publishYear}</span>
                      )}
                    </div>
                    <Link href={`/books/${rec.book.id}`} className={buttonVariants({ size: 'sm' })}>View Details</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
