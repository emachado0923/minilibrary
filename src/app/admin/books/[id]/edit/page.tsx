import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { EditBookForm } from '@/components/books/edit-book-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EditBookPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const session = await getSession()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const { id } = await params

  const book = await db.book.findUnique({
    where: { id },
  })

  if (!book) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel de admin
        </Link>
        <h1 className="text-4xl font-bold mb-2">Editar Libro</h1>
        <p className="text-muted-foreground">
          Modifica la información del libro &quot;{book.title}&quot;
        </p>
      </div>

      <EditBookForm book={book} />
    </div>
  )
}