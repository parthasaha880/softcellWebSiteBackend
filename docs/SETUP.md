# Backend Setup & Installation

## Prerequisites

- Node.js 18+ or 20+
- PostgreSQL 12+
- npm or yarn

## Installation Steps

### 1. Environment Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=softcell_db
PORT=3001
JWT_SECRET=your_secret_key_here
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Ensure PostgreSQL is running. The database will be created automatically on first run.

### 4. Run Seeder

```bash
npm run seed
```

This populates the database with initial data:
- Admin user (admin@softcell.com / admin@123)
- Sample products, services, team members
- Sample blog posts and categories
- Default settings

### 5. Start Development Server

```bash
npm run dev
```

Backend runs on `http://localhost:3001`

## Project Structure

```
src/
├── database/
│   ├── data-source.ts      # TypeORM configuration
│   └── seeder.ts           # Database seeding
├── entities/
│   └── index.ts            # All TypeORM entities
├── middleware/
│   └── auth.middleware.ts  # JWT verification
├── routes/
│   ├── auth.routes.ts      # Authentication
│   ├── page.routes.ts      # Pages
│   ├── product.routes.ts   # Products
│   ├── service.routes.ts   # Services
│   ├── client.routes.ts    # Clients
│   ├── team.routes.ts      # Team
│   ├── iso.routes.ts       # ISO Certificates
│   ├── blog.routes.ts      # Blog
│   ├── contact.routes.ts   # Contact Form
│   ├── newsletter.routes.ts # Newsletter
│   └── setting.routes.ts   # Settings
├── services/
│   └── email.service.ts    # Nodemailer config
└── main.ts                 # Entry point
```

## Available Scripts

```bash
npm run dev      # Start development server with auto-reload
npm run build    # Build for production
npm run seed     # Populate database with sample data
npm run start    # Start production server
```

## Default Admin Credentials

After seeding:
- Email: `admin@softcell.com`
- Password: `admin@123`

**⚠️ Important:** Change these immediately in production!

## API Endpoints

All API endpoints are prefixed with `/api`

### Public Endpoints
- `GET /pages` - Get all pages
- `GET /products` - Get products
- `GET /services` - Get services
- `GET /clients` - Get clients
- `GET /team` - Get team members
- `GET /iso` - Get ISO certificates
- `GET /blog/posts` - Get blog posts
- `GET /settings` - Get settings
- `POST /contact` - Submit contact form
- `POST /newsletter/subscribe` - Newsletter signup

### Protected Endpoints (Admin Only)
- `POST /auth/login` - Admin login
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- Same pattern for: services, clients, team, iso, blog

## Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres

# Create database if not exists
createdb softcell_db
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Email Not Sending
- Use app-specific password for Gmail
- Enable "Less secure app access" if using Gmail
- Check firewall/antivirus blocking SMTP

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | secret |
| DB_NAME | Database name | softcell_db |
| PORT | Server port | 3001 |
| JWT_SECRET | JWT signing key | very-secret-key |
| GMAIL_EMAIL | Gmail address | user@gmail.com |
| GMAIL_PASSWORD | Gmail app password | xxxx xxxx xxxx xxxx |

## Next Steps

1. Review the API documentation
2. Check database schema
3. Start developing with the frontend
4. Deploy when ready (see DEPLOYMENT.md)

For API details, see [API.md](./API.md)
