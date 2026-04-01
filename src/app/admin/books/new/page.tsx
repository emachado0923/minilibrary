import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { NewBookForm } from '@/components/books/new-book-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewBookPage() {
  const session = await getSession()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel de admin
        </Link>
        <h1 className="text-4xl font-bold mb-2">Agregar Nuevo Libro</h1>
        <p className="text-muted-foreground">
          Complete la información del libro para agregarlo al catálogo
        </p>
      </div>

      <NewBookForm />
    </div>
  )
}