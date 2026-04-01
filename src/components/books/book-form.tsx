'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BookFormData {
  isbn: string
  title: string
  author: string
  publisher: string
  publishYear: string
  category: string
  copiesTotal: string
  coverUrl: string
  description: string
}

interface BookFormProps {
  initialData?: {
    id: string
    isbn: string
    title: string
    author: string
    publisher: string | null
    publishYear: number | null
    category: string
    copiesTotal: number
    coverUrl: string | null
    description: string | null
  }
}

export function BookForm({ initialData }: BookFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [form, setForm] = useState<BookFormData>({
    isbn: initialData?.isbn ?? '',
    title: initialData?.title ?? '',
    author: initialData?.author ?? '',
    publisher: initialData?.publisher ?? '',
    publishYear: initialData?.publishYear?.toString() ?? '',
    category: initialData?.category ?? '',
    copiesTotal: initialData?.copiesTotal?.toString() ?? '1',
    coverUrl: initialData?.coverUrl ?? '',
    description: initialData?.description ?? '',
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingMeta, setFetchingMeta] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function fetchMetadata() {
    if (!form.isbn) return
    setFetchingMeta(true)
    try {
      const res = await fetch(`/api/books/metadata?isbn=${encodeURIComponent(form.isbn)}`)
      if (res.ok) {
        const data = await res.json()
        setForm((prev) => ({
          ...prev,
          title: data.title ?? prev.title,
          author: data.author ?? prev.author,
          publisher: data.publisher ?? prev.publisher,
          publishYear: data.publishYear?.toString() ?? prev.publishYear,
          category: data.category ?? prev.category,
          coverUrl: data.coverUrl ?? prev.coverUrl,
          description: data.description ?? prev.description,
        }))
      }
    } catch {
      // silently fail
    } finally {
      setFetchingMeta(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload: Record<string, unknown> = {
      isbn: form.isbn,
      title: form.title,
      author: form.author,
      category: form.category,
      copiesTotal: parseInt(form.copiesTotal),
    }
    if (form.publisher) payload.publisher = form.publisher
    if (form.publishYear) payload.publishYear = parseInt(form.publishYear)
    if (form.coverUrl) payload.coverUrl = form.coverUrl
    if (form.description) payload.description = form.description

    try {
      const url = isEdit ? `/api/books/${initialData!.id}` : '/api/books'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'An error occurred')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Book' : 'New Book'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ISBN with auto-fill */}
          <div className="space-y-1.5">
            <Label htmlFor="isbn">ISBN *</Label>
            <div className="flex gap-2">
              <Input
                id="isbn"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="e.g. 9780743273565"
                required
                disabled={isEdit}
              />
              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchMetadata}
                  disabled={fetchingMeta || !form.isbn}
                  className="shrink-0"
                >
                  {fetchingMeta ? 'Fetching…' : 'Auto-fill'}
                </Button>
              )}
            </div>
            {!isEdit && (
              <p className="text-xs text-muted-foreground">Enter ISBN and click Auto-fill to populate fields from Google Books.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Book title"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Author name"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Fiction, Science, History"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="copiesTotal">Total Copies *</Label>
              <Input
                id="copiesTotal"
                name="copiesTotal"
                type="number"
                min={1}
                value={form.copiesTotal}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Publisher name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publishYear">Publish Year</Label>
              <Input
                id="publishYear"
                name="publishYear"
                type="number"
                min={1000}
                max={new Date().getFullYear()}
                value={form.publishYear}
                onChange={handleChange}
                placeholder="e.g. 2001"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coverUrl">Cover URL</Label>
            <Input
              id="coverUrl"
              name="coverUrl"
              value={form.coverUrl}
              onChange={handleChange}
              placeholder="https://…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Brief description of the book…"
              className="h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Book'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
