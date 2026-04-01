'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const categories = [
  'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology',
  'Philosophy', 'Psychology', 'Art', 'Music', 'Sports', 'Travel', 'Cooking',
  'Health', 'Business', 'Education', 'Religion', 'Politics', 'Mystery', 'Romance'
]

interface Book {
  id: string
  isbn: string
  title: string
  author: string
  publisher: string | null
  publishYear: number | null
  category: string
  copiesTotal: number
  copiesAvailable: number
  coverUrl: string | null
  description: string | null
}

interface EditBookFormProps {
  book: Book
}

export function EditBookForm({ book }: EditBookFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    publisher: book.publisher || '',
    publishYear: book.publishYear?.toString() || '',
    category: book.category,
    copiesTotal: book.copiesTotal.toString(),
    coverUrl: book.coverUrl || '',
    description: book.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = {
        ...formData,
        publishYear: formData.publishYear ? parseInt(formData.publishYear) : undefined,
        copiesTotal: parseInt(formData.copiesTotal),
        coverUrl: formData.coverUrl || undefined,
        description: formData.description || undefined
      }

      const res = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Error al actualizar el libro')
        return
      }

      router.push('/admin')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel de admin
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Libro</CardTitle>
          <CardDescription>
            Modifica los campos que deseas actualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN *</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  placeholder="978-0-123456-78-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copiesTotal">Cantidad de Copias *</Label>
                <Input
                  id="copiesTotal"
                  type="number"
                  min="1"
                  value={formData.copiesTotal}
                  onChange={(e) => handleChange('copiesTotal', e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {loading ? 'Actualizando...' : 'Actualizar Libro'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}