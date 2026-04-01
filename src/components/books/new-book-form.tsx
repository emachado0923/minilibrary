'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertCircle, Search } from 'lucide-react'

const categories = [
  'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology',
  'Philosophy', 'Psychology', 'Art', 'Music', 'Sports', 'Travel', 'Cooking',
  'Health', 'Business', 'Education', 'Religion', 'Politics', 'Mystery', 'Romance', 'General'
]

export function NewBookForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publishYear: '',
    category: '',
    copiesTotal: '1',
    coverUrl: '',
    description: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fetchMetadata = async () => {
    if (!formData.isbn) return
    setFetchingMeta(true)
    try {
      const res = await fetch(`/api/books/metadata?isbn=${encodeURIComponent(formData.isbn)}`)
      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: Record<string, unknown> = {
        isbn: formData.isbn,
        title: formData.title,
        author: formData.author,
        category: formData.category,
        copiesTotal: parseInt(formData.copiesTotal),
      }
      if (formData.publisher) payload.publisher = formData.publisher
      if (formData.publishYear) payload.publishYear = parseInt(formData.publishYear)
      if (formData.coverUrl) payload.coverUrl = formData.coverUrl
      if (formData.description) payload.description = formData.description

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Error al crear el libro')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Información del Libro</CardTitle>
        <CardDescription>Todos los campos marcados con * son obligatorios</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ISBN + auto-fill */}
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN *</Label>
            <div className="flex gap-2">
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
                placeholder="978-0-123456-78-9"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={fetchMetadata}
                disabled={fetchingMeta || !formData.isbn}
                className="shrink-0 gap-1.5"
              >
                {fetchingMeta ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Auto-fill
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa el ISBN y haz clic en Auto-fill para completar los campos desde Google Books.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="El título del libro"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Autor *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Nombre del autor"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="copiesTotal">Cantidad de Copias *</Label>
              <Input
                id="copiesTotal"
                type="number"
                min="1"
                value={formData.copiesTotal}
                onChange={(e) => handleChange('copiesTotal', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publisher">Editorial</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => handleChange('publisher', e.target.value)}
                placeholder="Nombre de la editorial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishYear">Año de Publicación</Label>
              <Input
                id="publishYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.publishYear}
                onChange={(e) => handleChange('publishYear', e.target.value)}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl">URL de la Portada</Label>
            <Input
              id="coverUrl"
              type="url"
              value={formData.coverUrl}
              onChange={(e) => handleChange('coverUrl', e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Breve descripción del libro..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Libro'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
