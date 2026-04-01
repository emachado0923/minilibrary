'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

// Import CSS at top level
import 'datatables.net-dt/css/dataTables.dataTables.css'

// Dynamically import DataTables to avoid SSR issues
const DataTable = dynamic(
  async () => {
    const DataTablesLib = (await import('datatables.net-react')).default
    const DT = (await import('datatables.net-dt')).default
    DataTablesLib.use(DT)
    return DataTablesLib
  },
  { ssr: false }
)

interface Book {
  id: string
  title: string
  author: string
  category: string
  publisher: string | null
  publishYear: number | null
  isbn: string | null
  copiesAvailable: number
  copiesTotal: number
}

interface BooksTableProps {
  books: Book[]
  showActions?: boolean
  userRole?: string
}

export function BooksTable({ books, showActions = false, userRole }: BooksTableProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const deleteBook = async (bookId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        // Refresh the page to update the table
        router.refresh()
      } else {
        const error = await res.json()
        alert(`Error al eliminar el libro: ${error.error}`)
      }
    } catch (error) {
      alert('Error de conexión. Intenta de nuevo.')
    }
  }

  // Make deleteBook available globally for the onclick handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).deleteBook = deleteBook
    }
  }, [])

  if (!mounted) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Loading books...
        </div>
      </div>
    )
  }

  const columns = [
    {
      title: 'Title',
      data: 'title',
      render: (data: string, type: string, row: Book) => {
        if (type === 'display') {
          return `<a href="/books/${row.id}" class="font-medium text-primary hover:underline">${data}</a>`
        }
        return data
      }
    },
    {
      title: 'Author',
      data: 'author'
    },
    {
      title: 'Category',
      data: 'category'
    },
    {
      title: 'Publisher',
      data: 'publisher',
      render: (data: string | null) => data || 'N/A'
    },
    {
      title: 'Year',
      data: 'publishYear',
      render: (data: number | null) => data || 'N/A'
    },
    {
      title: 'ISBN',
      data: 'isbn',
      render: (data: string | null) => data || 'N/A'
    },
    {
      title: 'Availability',
      data: null,
      orderable: false,
      render: (data: any, type: string, row: Book) => {
        const available = row.copiesAvailable > 0
        const badgeClass = available 
          ? 'inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground'
          : 'inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground'
        const text = available ? 'Available' : 'Unavailable'
        return `<span class="${badgeClass}">${text}</span>`
      }
    },
    {
      title: 'Copies',
      data: null,
      render: (data: any, type: string, row: Book) => {
        return `${row.copiesAvailable}/${row.copiesTotal}`
      }
    },
    ...(showActions && userRole === 'ADMIN' ? [{
      title: 'Actions',
      data: null,
      orderable: false,
      searchable: false,
      render: (data: any, type: string, row: Book) => {
        return `
          <div class="flex items-center gap-2">
            <a href="/admin/books/${row.id}/edit" class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
              Editar
            </a>
            <button onclick="deleteBook('${row.id}')" class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">
              Eliminar
            </button>
          </div>
        `
      }
    }] : [])
  ]

  return (
    <div className="rounded-md border bg-card">
      <DataTable
        data={books}
        columns={columns}
        className="display"
        options={{
          pageLength: 25,
          lengthMenu: [10, 25, 50, 100],
          order: [[0, 'asc']],
          language: {
            search: 'Search books:',
            lengthMenu: 'Show _MENU_ books per page',
            info: 'Showing _START_ to _END_ of _TOTAL_ books',
            infoEmpty: 'No books available',
            infoFiltered: '(filtered from _MAX_ total books)',
            zeroRecords: 'No books found matching your search',
            emptyTable: 'No books available in the catalog'
          },
          autoWidth: false
        }}
      />
    </div>
  )
}
