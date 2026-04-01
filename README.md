# Library Management System

Un sistema completo de gestión de bibliotecas construido con Next.js 16, Prisma, MySQL y autenticación con NextAuth.js v5. Incluye funcionalidades de CRUD para libros, sistema de préstamos/devoluciones, búsqueda avanzada, recomendaciones con IA y control de acceso basado en roles.

## 🚀 Características

### Funcionalidades Principales
- ✅ **Gestión de Libros**: Crear, editar, eliminar y buscar libros
- ✅ **Sistema de Préstamos**: Checkout y return de libros con seguimiento de inventario
- ✅ **Búsqueda Avanzada**: Buscar por título, autor, ISBN, género, etc.
- ✅ **Autenticación**: Login con Google/GitHub y roles de usuario
- ✅ **Panel de Administración**: Dashboard con estadísticas y gestión completa
- ✅ **Recomendaciones con IA**: Sugerencias personalizadas usando OpenRouter API

### Funcionalidades Adicionales
- 🎨 **UI Moderna**: Componentes Shadcn/ui con Tailwind CSS
- 📱 **Responsive**: Diseño adaptativo para móviles y desktop
- 🔒 **Control de Roles**: ADMIN, LIBRARIAN, USER con permisos específicos
- 📊 **Dashboard**: Estadísticas en tiempo real y reportes
- 🤖 **Asistente IA**: Recomendaciones inteligentes de libros
- 📅 **Seguimiento de Préstamos**: Fechas de devolución y alertas de atrasos

## 🛠️ Tecnologías

- **Frontend**: Next.js 16.2.2 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: MySQL
- **Autenticación**: NextAuth.js v5 con Google/GitHub OAuth
- **UI/UX**: Shadcn/ui, Tailwind CSS, Lucide Icons
- **IA**: OpenRouter API para recomendaciones
- **Despliegue**: Listo para Vercel/Netlify

## 📋 Requisitos Previos

- Node.js 18+
- MySQL 8.0+
- npm o yarn
- Cuentas de Google y GitHub para OAuth (opcional)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd library-system
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Base de datos
DATABASE_URL="mysql://username:password@localhost:3306/library_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenRouter API (para recomendaciones con IA)
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### 4. Configurar la Base de Datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# (Opcional) Poblar con datos de ejemplo
npx prisma db seed
```

### 5. Ejecutar la Aplicación

```bash
# Modo desarrollo
npm run dev

# Construir para producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

## 👥 Roles de Usuario

### ADMIN
- Acceso completo a todas las funcionalidades
- Crear, editar y eliminar libros
- Gestionar usuarios y roles
- Ver todas las estadísticas y reportes

### LIBRARIAN
- Gestionar libros (crear, editar, eliminar)
- Procesar préstamos y devoluciones
- Ver estadísticas de la biblioteca

### USER
- Buscar y ver libros disponibles
- Solicitar préstamos de libros
- Ver sus préstamos activos
- Recibir recomendaciones personalizadas

## 📖 Uso de la Aplicación

### Para Administradores/Librarianos

1. **Crear Libros**: Ve a `/admin/books/new` y completa el formulario
2. **Editar Libros**: Desde la tabla de libros, haz clic en "Editar"
3. **Eliminar Libros**: Solo libros sin préstamos activos pueden eliminarse
4. **Ver Estadísticas**: Panel de administración con métricas en tiempo real

### Para Usuarios

1. **Buscar Libros**: Usa la barra de búsqueda en la página principal
2. **Ver Detalles**: Haz clic en cualquier libro para ver información completa
3. **Solicitar Préstamo**: Desde la página del libro, haz clic en "Solicitar Préstamo"
4. **Ver Mis Préstamos**: Ve a `/my-loans` para ver tus libros prestados
5. **Devolver Libros**: Usa el enlace "Devolver" en tus préstamos activos

### Recomendaciones con IA

- Ve a `/recommendations` para obtener sugerencias personalizadas
- El sistema analiza tu historial de préstamos para recomendar libros similares

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── books/             # Páginas de libros
│   └── components/        # Componentes React
├── lib/                   # Utilidades y configuración
│   ├── auth.ts           # Configuración NextAuth
│   ├── db.ts             # Cliente Prisma
│   └── ai.ts             # Integración con OpenRouter
└── types/                # Definiciones TypeScript
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

### Otros Proveedores

Asegúrate de configurar:
- Variables de entorno
- Base de datos MySQL externa
- Build command: `npm run build`
- Start command: `npm start`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs de la consola del navegador
2. Verifica la configuración de la base de datos
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Revisa la documentación de Next.js y Prisma

## 🎯 Roadmap

- [ ] Notificaciones por email para devoluciones
- [ ] API REST para integraciones externas
- [ ] Sistema de reservas de libros
- [ ] Dashboard móvil nativo
- [ ] Integración con servicios de libros externos (Google Books API)

---

¡Gracias por usar nuestro sistema de gestión de bibliotecas! 📚✨

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI API
OPENAI_API_KEY="your-openai-api-key"

# Optional: Google Books API for metadata
GOOGLE_BOOKS_API_KEY="your-google-books-api-key"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up OAuth Providers

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with 100 sample books
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Test Users

After seeding, you can use these test accounts:

- **Admin**: admin@library.com
- **Librarian**: librarian@library.com  
- **User**: user@library.com

*Note: These are database records only. You'll need to sign in via OAuth providers.*

## Project Structure

```
library-system/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed data (100 books)
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── books/     # Book CRUD
│   │   │   ├── transactions/  # Checkout/return
│   │   │   └── recommendations/  # AI suggestions
│   │   ├── books/         # Book catalog pages
│   │   ├── my-loans/      # User loans page
│   │   ├── admin/         # Admin panel
│   │   └── page.tsx       # Dashboard
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── layout/        # Navbar, etc.
│   ├── lib/
│   │   ├── db.ts          # Prisma client
│   │   ├── auth.ts        # NextAuth config
│   │   ├── validations.ts # Zod schemas
│   │   └── ai.ts          # OpenAI integration
│   └── types/             # TypeScript definitions
├── .env                   # Environment variables
└── package.json
```

## API Endpoints

### Books
- `GET /api/books` - List books with search/filters
- `POST /api/books` - Create book (Librarian+)
- `GET /api/books/[id]` - Get book details
- `PATCH /api/books/[id]` - Update book (Librarian+)
- `DELETE /api/books/[id]` - Delete book (Librarian+)
- `GET /api/books/metadata?isbn=...` - Fetch metadata from Google Books

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Checkout book
- `POST /api/transactions/[id]/return` - Return book

### AI
- `GET /api/recommendations` - Get personalized recommendations

## User Roles

### USER (Default)
- Browse and search books
- Checkout/return own books (max 5 active)
- View own transaction history
- Get AI recommendations

### LIBRARIAN
- All USER permissions
- Create, edit, delete books
- View all transactions
- Manage all checkouts/returns

### ADMIN
- All LIBRARIAN permissions
- Manage user roles
- Access system analytics

## Database Schema

### Key Models

**User**
- Authentication via NextAuth
- Role-based permissions
- Transaction history

**Book**
- ISBN, title, author, publisher, year
- Category, copies management
- Cover image, description

**Transaction**
- Checkout/return tracking
- Due dates and status
- Overdue detection

**AIRecommendation**
- User-specific suggestions
- Score and reasoning

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Database Options

- **PlanetScale** - MySQL-compatible, free tier
- **Railway** - PostgreSQL/MySQL, easy setup
- **AWS RDS** - Production-grade MySQL

Update `DATABASE_URL` in environment variables accordingly.

## Security Features

- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Secure session management
- ✅ Role-based authorization
- ✅ Environment variable protection

## Troubleshooting

### Database Connection Issues
```bash
# Verify MySQL is running
mysql -u root -p

# Create database manually if needed
CREATE DATABASE library_system;
```

### Prisma Client Errors
```bash
# Regenerate client
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
npm run db:seed
```

### OAuth Issues
- Verify redirect URIs match exactly
- Check credentials are correct
- Ensure OAuth apps are not in development mode restrictions

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - feel free to use this project for learning or production.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Prisma, and OpenAI
