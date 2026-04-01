-- Insert test users
INSERT INTO users (id, email, name, role, emailVerified, createdAt, updatedAt) VALUES
('user1', 'admin@library.com', 'Admin User', 'ADMIN', NOW(), NOW(), NOW()),
('user2', 'librarian@library.com', 'Librarian User', 'LIBRARIAN', NOW(), NOW(), NOW()),
('user3', 'user@library.com', 'Regular User', 'USER', NOW(), NOW(), NOW());

-- Insert 10 sample books (you can add more manually if needed)
INSERT INTO books (id, isbn, title, author, publisher, publishYear, category, copiesTotal, copiesAvailable, coverUrl, description, createdAt, updatedAt) VALUES
('book1', '9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 'Fiction', 3, 3, 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg', 'A gripping tale of racial injustice and childhood innocence.', NOW(), NOW()),
('book2', '9780451524935', '1984', 'George Orwell', 'Signet Classic', 1949, 'Science Fiction', 2, 2, 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', 'A dystopian social science fiction novel and cautionary tale.', NOW(), NOW()),
('book3', '9780316769174', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 1951, 'Fiction', 2, 2, 'https://covers.openlibrary.org/b/isbn/9780316769174-M.jpg', 'The story of teenage rebellion and alienation.', NOW(), NOW()),
('book4', '9780743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Fiction', 4, 4, 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg', 'A portrait of the Jazz Age in all its decadence and excess.', NOW(), NOW()),
('book5', '9780141439518', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 1813, 'Romance', 3, 3, 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg', 'A romantic novel of manners.', NOW(), NOW()),
('book6', '9780547928227', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', 1937, 'Fantasy', 5, 5, 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg', 'A fantasy novel about the adventures of Bilbo Baggins.', NOW(), NOW()),
('book7', '9780439708180', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Scholastic', 1997, 'Fantasy', 4, 4, 'https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg', 'The first novel in the Harry Potter series.', NOW(), NOW()),
('book8', '9780062315007', 'The Alchemist', 'Paulo Coelho', 'HarperOne', 1988, 'Fiction', 2, 2, 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg', 'A philosophical book about following your dreams.', NOW(), NOW()),
('book9', '9780345339683', 'The Lord of the Rings', 'J.R.R. Tolkien', 'Del Rey', 1954, 'Fantasy', 3, 3, 'https://covers.openlibrary.org/b/isbn/9780345339683-M.jpg', 'An epic high-fantasy novel.', NOW(), NOW()),
('book10', '9780142437230', 'The Kite Runner', 'Khaled Hosseini', 'Riverhead Books', 2003, 'Fiction', 2, 2, 'https://covers.openlibrary.org/b/isbn/9780142437230-M.jpg', 'A story of friendship, betrayal, and redemption.', NOW(), NOW());
