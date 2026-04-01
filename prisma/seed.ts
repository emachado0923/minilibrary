import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller',
  'Romance', 'Horror', 'Biography', 'History', 'Science', 'Technology',
  'Self-Help', 'Business', 'Philosophy', 'Poetry', 'Drama', 'Adventure'
]

const sampleBooks = [
  { isbn: '9780061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'Harper Perennial', year: 1960, category: 'Fiction', description: 'A gripping tale of racial injustice and childhood innocence.' },
  { isbn: '9780451524935', title: '1984', author: 'George Orwell', publisher: 'Signet Classic', year: 1949, category: 'Science Fiction', description: 'A dystopian social science fiction novel and cautionary tale.' },
  { isbn: '9780316769174', title: 'The Catcher in the Rye', author: 'J.D. Salinger', publisher: 'Little, Brown', year: 1951, category: 'Fiction', description: 'The story of teenage rebellion and alienation.' },
  { isbn: '9780743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publisher: 'Scribner', year: 1925, category: 'Fiction', description: 'A portrait of the Jazz Age in all its decadence and excess.' },
  { isbn: '9780141439518', title: 'Pride and Prejudice', author: 'Jane Austen', publisher: 'Penguin Classics', year: 1813, category: 'Romance', description: 'A romantic novel of manners.' },
  { isbn: '9780547928227', title: 'The Hobbit', author: 'J.R.R. Tolkien', publisher: 'Houghton Mifflin', year: 1937, category: 'Fantasy', description: 'A fantasy novel and children\'s book about the adventures of Bilbo Baggins.' },
  { isbn: '9780439708180', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', publisher: 'Scholastic', year: 1997, category: 'Fantasy', description: 'The first novel in the Harry Potter series.' },
  { isbn: '9780062315007', title: 'The Alchemist', author: 'Paulo Coelho', publisher: 'HarperOne', year: 1988, category: 'Fiction', description: 'A philosophical book about following your dreams.' },
  { isbn: '9780345339683', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', publisher: 'Del Rey', year: 1954, category: 'Fantasy', description: 'An epic high-fantasy novel.' },
  { isbn: '9780142437230', title: 'The Kite Runner', author: 'Khaled Hosseini', publisher: 'Riverhead Books', year: 2003, category: 'Fiction', description: 'A story of friendship, betrayal, and redemption.' },
]

async function generateBooks(count: number) {
  const books = []
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  const publishers = ['Penguin Random House', 'HarperCollins', 'Simon & Schuster', 'Macmillan', 'Hachette', 'Scholastic']
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const year = 1950 + Math.floor(Math.random() * 75)
    const copies = Math.floor(Math.random() * 5) + 1
    
    if (i < sampleBooks.length) {
      books.push({
        isbn: sampleBooks[i].isbn,
        title: sampleBooks[i].title,
        author: sampleBooks[i].author,
        publisher: sampleBooks[i].publisher,
        publishYear: sampleBooks[i].year,
        category: sampleBooks[i].category,
        copiesTotal: copies,
        copiesAvailable: copies,
        coverUrl: `https://covers.openlibrary.org/b/isbn/${sampleBooks[i].isbn}-M.jpg`,
        description: sampleBooks[i].description,
      })
    } else {
      const bookNum = i + 1
      books.push({
        isbn: `978${String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')}`,
        title: `${category} Book ${bookNum}`,
        author: `${firstName} ${lastName}`,
        publisher: publishers[Math.floor(Math.random() * publishers.length)],
        publishYear: year,
        category,
        copiesTotal: copies,
        copiesAvailable: copies,
        coverUrl: `https://picsum.photos/seed/${bookNum}/200/300`,
        description: `An engaging ${category.toLowerCase()} book that explores fascinating themes and captivating narratives.`,
      })
    }
  }
  
  return books
}

async function main() {
  console.log('🌱 Starting seed...')

  await prisma.aIRecommendation.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.book.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@library.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  const librarianUser = await prisma.user.create({
    data: {
      email: 'librarian@library.com',
      name: 'Librarian User',
      role: UserRole.LIBRARIAN,
      emailVerified: new Date(),
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@library.com',
      name: 'Regular User',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created users')

  const books = await generateBooks(100)
  
  for (const book of books) {
    await prisma.book.create({ data: book })
  }

  console.log('✅ Created 100 books')

  const allBooks = await prisma.book.findMany({ take: 10 })
  
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  await prisma.transaction.create({
    data: {
      userId: regularUser.id,
      bookId: allBooks[0].id,
      type: 'CHECKOUT',
      dueDate,
      status: 'ACTIVE',
    },
  })

  await prisma.book.update({
    where: { id: allBooks[0].id },
    data: { copiesAvailable: { decrement: 1 } },
  })

  const pastDueDate = new Date()
  pastDueDate.setDate(pastDueDate.getDate() - 5)

  await prisma.transaction.create({
    data: {
      userId: regularUser.id,
      bookId: allBooks[1].id,
      type: 'CHECKOUT',
      dueDate: pastDueDate,
      status: 'OVERDUE',
    },
  })

  await prisma.book.update({
    where: { id: allBooks[1].id },
    data: { copiesAvailable: { decrement: 1 } },
  })

  console.log('✅ Created sample transactions')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: 3 (1 Admin, 1 Librarian, 1 User)`)
  console.log(`   - Books: 100`)
  console.log(`   - Transactions: 2 (1 Active, 1 Overdue)`)
  console.log('\n🔐 Test Credentials:')
  console.log(`   - Admin: admin@library.com`)
  console.log(`   - Librarian: librarian@library.com`)
  console.log(`   - User: user@library.com`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
