# Guía de Despliegue - Library Management System

## 🚀 Despliegue en Producción

Esta guía te ayudará a desplegar el sistema de gestión de bibliotecas en diferentes plataformas.

## 📋 Requisitos para Producción

### Base de Datos
- MySQL 8.0+ (PlanetScale, AWS RDS, Google Cloud SQL, etc.)
- Configuración de conexión segura
- Backup automático configurado

### Variables de Entorno
```env
# Producción
NODE_ENV=production
NEXTAUTH_URL=https://tu-dominio.com
DATABASE_URL=mysql://usuario:password@host:puerto/database

# OAuth Providers
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret

# AI (OpenRouter)
OPENROUTER_API_KEY=tu-openrouter-api-key

# NextAuth Secret (genera uno seguro)
NEXTAUTH_SECRET=tu-nextauth-secret-seguro
```

## 🌐 Opciones de Despliegue

### 1. Vercel (Recomendado)

#### Configuración Automática
1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente Next.js
3. Configura las variables de entorno en el dashboard
4. Despliega con un click

#### Variables de Entorno en Vercel
- Ve a Project Settings > Environment Variables
- Agrega todas las variables del `.env`
- Asegúrate de que `NEXTAUTH_URL` apunte a tu dominio de Vercel

#### Base de Datos en Vercel
- Usa PlanetScale (recomendado) o cualquier MySQL compatible
- Configura `DATABASE_URL` con la conexión de PlanetScale

### 2. Netlify

#### Build Settings
```yaml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### Functions
Netlify requiere configuración adicional para API routes. Considera usar Vercel para simplicidad.

### 3. Railway

#### Configuración
1. Conecta tu repositorio
2. Railway detectará automáticamente Next.js
3. Agrega variables de entorno
4. Configura base de datos MySQL integrada

### 4. Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Construir la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://mysql:password@db:3306/library_db
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: library_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 🔧 Configuración de Base de Datos

### PlanetScale (Recomendado para Vercel)
```bash
# Instalar PlanetScale CLI
npm install -g @planetscale/cli

# Crear base de datos
pscale database create library-system

# Conectar
pscale connect library-system main --port 3309

# Ejecutar migraciones
npx prisma db push
```

### AWS RDS MySQL
1. Crea una instancia RDS MySQL
2. Configura grupo de seguridad para acceso desde tu aplicación
3. Usa el endpoint de RDS en `DATABASE_URL`

### Google Cloud SQL
1. Crea instancia MySQL en Cloud SQL
2. Configura conectividad (Cloud Run, etc.)
3. Usa el connection string proporcionado

## 🔐 Configuración de OAuth

### Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Configura authorized redirect URIs:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://tu-dominio.com/api/auth/callback/google`

### GitHub OAuth
1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Configura:
   - Homepage URL: `https://tu-dominio.com`
   - Authorization callback URL: `https://tu-dominio.com/api/auth/callback/github`

## 🤖 Configuración de IA (OpenRouter)

1. Regístrate en [OpenRouter](https://openrouter.ai/)
2. Obtén tu API key
3. Configura `OPENROUTER_API_KEY` en variables de entorno
4. El sistema usará GPT-4o-mini por defecto para recomendaciones

## 📊 Monitoreo y Logs

### Vercel
- Logs en tiempo real en el dashboard
- Analytics integrados
- Error tracking con Sentry (opcional)

### Configuración de Sentry
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "tu-dsn-de-sentry",
  tracesSampleRate: 1.0,
});
```

## 🔄 Migraciones de Base de Datos

### Para Actualizaciones
```bash
# Crear migración
npx prisma migrate dev --name nombre-de-la-migracion

# Aplicar en producción
npx prisma migrate deploy
```

### Backup y Restore
```bash
# Backup
mysqldump -u usuario -p base_de_datos > backup.sql

# Restore
mysql -u usuario -p base_de_datos < backup.sql
```

## 🚨 Solución de Problemas

### Errores Comunes

#### Database Connection Error
- Verifica `DATABASE_URL`
- Asegúrate de que la base de datos esté accesible
- Revisa firewall y security groups

#### OAuth Callback Errors
- Verifica que las redirect URIs estén correctas
- Asegúrate de que `NEXTAUTH_URL` sea correcto
- Revisa que las credenciales OAuth sean válidas

#### Build Errors
- Limpia cache: `rm -rf .next`
- Reinstala dependencias: `rm -rf node_modules && npm install`
- Verifica Node.js version (18+)

#### AI Recommendations Not Working
- Verifica `OPENROUTER_API_KEY`
- Revisa límites de API
- Verifica conectividad a OpenRouter

## 📈 Optimización de Performance

### Next.js Optimizations
- Image optimization automática
- Static generation donde sea posible
- API routes optimizadas

### Database Optimizations
- Índices en campos de búsqueda
- Connection pooling
- Query optimization con Prisma

### CDN y Caching
- Usa CDN para assets estáticos
- Configura cache headers apropiados
- Considera Redis para session storage

## 🔒 Seguridad

### Checklist de Seguridad
- [ ] Variables de entorno no expuestas
- [ ] HTTPS configurado
- [ ] Database credentials seguros
- [ ] OAuth redirect URIs correctas
- [ ] Rate limiting en APIs
- [ ] Input validation con Zod
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection (Next.js automático)

### Headers de Seguridad
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## 🎯 Próximos Pasos

1. Configura monitoreo continuo
2. Implementa CI/CD pipeline
3. Configura backups automáticos
4. Documenta procesos de mantenimiento
5. Planifica escalabilidad

---

¡Tu sistema de biblioteca está listo para producción! 🎉
3. Deploy

### 3. Environment Variables in Vercel

Add these in Project Settings → Environment Variables:

```
DATABASE_URL=mysql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OPENAI_API_KEY=...
```

### 4. Run Database Migrations

```bash
# From your local machine connected to PlanetScale
npx prisma db push
npx prisma db seed
```

## Option 2: Railway

### 1. Create Railway Project

1. Go to [Railway](https://railway.app)
2. Create new project
3. Add MySQL database
4. Deploy from GitHub

### 2. Configure Environment

Railway will auto-generate `DATABASE_URL`. Add the rest:

```
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OPENAI_API_KEY=...
```

### 3. Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

## Option 3: AWS (EC2 + RDS)

### 1. Set Up RDS MySQL

1. Create RDS MySQL 8.0 instance
2. Configure security groups
3. Note connection details

### 2. Set Up EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd library-system

# Install dependencies
npm install

# Set up environment
nano .env
# Add all environment variables

# Build
npm run build

# Start with PM2
pm2 start npm --name "library-system" -- start
pm2 save
pm2 startup
```

### 3. Set Up Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test OAuth login flows
- [ ] Seed initial data
- [ ] Test book CRUD operations
- [ ] Test checkout/return flow
- [ ] Verify AI recommendations work
- [ ] Check all API endpoints
- [ ] Test role-based permissions
- [ ] Monitor error logs
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

## OAuth Configuration

### Google OAuth

Update authorized redirect URIs:
- `https://your-domain.com/api/auth/callback/google`

### GitHub OAuth

Update authorization callback URL:
- `https://your-domain.com/api/auth/callback/github`

## Database Backups

### PlanetScale

Automatic backups included. Manual backup:
```bash
pscale backup create library-system production
```

### Railway

Automatic backups available in Pro plan.

### AWS RDS

Enable automated backups in RDS settings.

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics

### Sentry Error Tracking

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Uptime Monitoring

- UptimeRobot
- Pingdom
- Better Uptime

## Performance Optimization

### Enable Caching

```typescript
// In API routes
export const revalidate = 60 // Revalidate every 60 seconds
```

### Database Indexes

Already configured in Prisma schema:
- Book title, author, category, ISBN
- Transaction userId, bookId, status, dueDate

### Image Optimization

Use Next.js Image component for book covers.

## Security Hardening

1. **Rate Limiting**
```bash
npm install @upstash/ratelimit @upstash/redis
```

2. **CORS Configuration**
```typescript
// next.config.ts
headers: async () => [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'your-domain.com' }
    ]
  }
]
```

3. **Security Headers**
```typescript
// next.config.ts
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
    ]
  }
]
```

## Troubleshooting

### Database Connection Issues

Check `DATABASE_URL` format:
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

### OAuth Redirect Errors

Verify redirect URIs match exactly (including https://).

### Build Failures

Check Node.js version (18+):
```bash
node --version
```

### API Timeouts

Increase serverless function timeout in Vercel:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Scaling Considerations

### Database

- PlanetScale: Auto-scales
- RDS: Increase instance size
- Add read replicas for heavy read workloads

### Application

- Vercel: Auto-scales
- EC2: Use Auto Scaling Groups
- Add CDN (Cloudflare, CloudFront)

### Caching

- Redis for session storage
- CDN for static assets
- Database query caching

## Cost Estimates

### Hobby/Small (< 1000 users)
- Vercel: Free
- PlanetScale: Free tier
- **Total: $0/month**

### Production (1000-10000 users)
- Vercel Pro: $20/month
- PlanetScale Scaler: $29/month
- **Total: ~$50/month**

### Enterprise (10000+ users)
- Vercel Enterprise: Custom
- PlanetScale Enterprise: Custom
- AWS RDS: $100-500/month
- **Total: $500-2000/month**

## Support

For deployment issues:
1. Check logs in your platform dashboard
2. Review environment variables
3. Test database connectivity
4. Verify OAuth configuration
5. Open an issue on GitHub

---

Good luck with your deployment! 🚀
