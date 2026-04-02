'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  category: string
  publisher: string | null
  publishYear: number | null
  isbn: string
  copiesAvailable: number
  copiesTotal: number
}

interface BooksTableProps {
  books: Book[]
  showActions?: boolean
  userRole?: string
}

type SortKey = 'title' | 'author' | 'category' | 'publishYear'
type SortDir = 'asc' | 'desc'

export function BooksTable({ books, showActions = false, userRole }: BooksTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const pageSize = 25

  const canEdit = showActions && userRole === 'ADMIN'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.isbn ?? '').toLowerCase().includes(q) ||
        (b.publisher ?? '').toLowerCase().includes(q),
    )
  }, [books, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    )
  }

  async function handleDelete(bookId: string) {
    if (!confirm('¿Eliminar este libro? Esta acción no se puede deshacer.')) return
    setDeleting(bookId)
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert('Error de conexión.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, autor, categoría, ISBN…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {(
                [
                  { key: 'title', label: 'Título' },
                  { key: 'author', label: 'Autor' },
                  { key: 'category', label: 'Categoría' },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                  onClick={() => handleSort(key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Editorial</th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort('publishYear')}
              >
                <span className="inline-flex items-center gap-1">
                  Año <SortIcon col="publishYear" />
                </span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ISBN</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Disponibilidad</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Copias</th>
              {canEdit && (
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={canEdit ? 9 : 8}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No se encontraron libros.
                </td>
              </tr>
            ) : (
              paginated.map((book) => (
                <tr key={book.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-[220px]">
                    <Link
                      href={`/books/${book.id}`}
                      className="text-primary hover:underline line-clamp-1"
                    >
                      {book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{book.author}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{book.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{book.publisher ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{book.publishYear ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {book.isbn ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={book.copiesAvailable > 0 ? 'default' : 'secondary'}>
                      {book.copiesAvailable > 0 ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {book.copiesAvailable}/{book.copiesTotal}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/books/${book.id}/edit`}>
                          <Button size="xs" variant="outline" className="gap-1">
                            <Pencil className="h-3 w-3" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="xs"
                          variant="destructive"
                          className="gap-1"
                          disabled={deleting === book.id}
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          {deleting === book.id ? '…' : 'Eliminar'}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length === 0
            ? 'Sin resultados'
            : `Mostrando ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, sorted.length)} de ${sorted.length} libro${sorted.length !== 1 ? 's' : ''}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
