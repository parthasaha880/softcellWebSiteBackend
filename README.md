# SOFTCELL Solutions - Backend API

Complete backend API for SOFTCELL Solutions website with full CRUD operations for all content management.

## Features

- RESTful API with Express.js
- PostgreSQL database with TypeORM
- JWT authentication & authorization
- Email service with Nodemailer
- Complete content management system
- Admin panel APIs
- Newsletter subscription system
- Contact form management

## Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── data-source.ts      # Database configuration
│   │   ├── seeder.ts            # Initial data seeding
│   │   └── migrations/          # Database migrations
│   ├── entities/                 # TypeORM entities
│   ├── routes/                   # API route handlers
│   │   ├── auth.routes.ts
│   │   ├── page.routes.ts
│   │   ├── product.routes.ts
│   │   ├── service.routes.ts
│   │   ├── client.routes.ts
│   │   ├── team.routes.ts
│   │   ├── iso.routes.ts
│   │   ├── blog.routes.ts
│   │   ├── contact.routes.ts
│   │   ├── newsletter.routes.ts
│   │   └── setting.routes.ts
│   ├── middleware/
│   │   └── auth.middleware.ts   # Authentication middleware
│   ├── services/
│   │   └── email.service.ts     # Email service
│   └── main.ts                   # Server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required configurations:
- Database credentials
- JWT secret
- Email service credentials (Gmail/SendGrid/etc)
- Admin email address

### 3. Setup PostgreSQL Database

```bash
# Create database
createdb softcell_db

# Or use your preferred database tool
```

### 4. Seed Initial Data

```bash
npm run seed
```

This will:
- Create all database tables
- Seed initial data (products, services, team, clients, etc.)
- Create default admin user (admin@softcell.com / admin@123)

### 5. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/change-password` - Change password (protected)
- `GET /api/auth/me` - Get current user (protected)

### Pages
- `GET /api/pages` - Get all published pages
- `GET /api/pages/:slug` - Get page by slug
- `POST /api/pages` - Create page (admin)
- `PUT /api/pages/:id` - Update page (admin)
- `DELETE /api/pages/:id` - Delete page (admin)

### Products
- `GET /api/products` - Get all published products
- `GET /api/products/:id` - Get product by id
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Services
- `GET /api/services` - Get all published services
- `GET /api/services/:id` - Get service by id
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Clients
- `GET /api/clients` - Get all published clients
- `GET /api/clients/featured` - Get featured clients
- `POST /api/clients` - Create client (admin)
- `PUT /api/clients/:id` - Update client (admin)
- `DELETE /api/clients/:id` - Delete client (admin)

### Team
- `GET /api/team` - Get all published team members
- `GET /api/team/:id` - Get team member by id
- `POST /api/team` - Create team member (admin)
- `PUT /api/team/:id` - Update team member (admin)
- `DELETE /api/team/:id` - Delete team member (admin)

### ISO Certificates
- `GET /api/iso` - Get all published certificates
- `GET /api/iso/featured` - Get featured certificates
- `POST /api/iso` - Create certificate (admin)
- `PUT /api/iso/:id` - Update certificate (admin)
- `DELETE /api/iso/:id` - Delete certificate (admin)

### Blog
- `GET /api/blog/posts` - Get all published blog posts
- `GET /api/blog/posts/:slug` - Get blog post by slug
- `GET /api/blog/categories` - Get all categories
- `POST /api/blog/posts` - Create blog post (admin)
- `PUT /api/blog/posts/:id` - Update blog post (admin)
- `DELETE /api/blog/posts/:id` - Delete blog post (admin)
- `POST /api/blog/categories` - Create category (admin)
- `DELETE /api/blog/categories/:id` - Delete category (admin)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all submissions (admin)
- `GET /api/contact/:id` - Get submission by id (admin)
- `PATCH /api/contact/:id/read` - Mark as read (admin)
- `PUT /api/contact/:id` - Update submission (admin)
- `DELETE /api/contact/:id` - Delete submission (admin)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter` - Get all subscribers (admin)
- `POST /api/newsletter/send` - Send newsletter (admin)
- `DELETE /api/newsletter/:id` - Delete subscriber (admin)

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings/:key` - Update setting (admin)
- `POST /api/settings/batch` - Update multiple settings (admin)

## Database Schema

The system includes the following main entities:

- **Pages**: Website pages (home, about, etc.)
- **Products**: Product listings
- **Services**: Service offerings
- **Clients**: Client logos and information
- **TeamMembers**: Team member profiles
- **IsoCertificates**: ISO certifications
- **BlogPosts**: Blog articles
- **BlogCategories**: Blog post categories
- **ContactSubmissions**: Contact form submissions
- **NewsletterSubscribers**: Newsletter subscribers
- **AdminUsers**: Admin user accounts
- **Settings**: Application settings

## Security Features

- JWT-based authentication
- Role-based access control (admin/editor)
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention via parameterized queries

## Email Service

Uses Nodemailer for sending emails:

1. **Contact Response**: Automatic reply to contact form submissions
2. **Admin Notification**: Alerts admin of new submissions
3. **Newsletter Welcome**: Welcome email for new subscribers
4. **Bulk Newsletter**: Send campaigns to all subscribers

Configure with Gmail, SendGrid, or any SMTP service.

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set NODE_ENV=production in .env

3. Run migrations:
```bash
npm run migration:run
```

4. Start server:
```bash
npm start
```

## Troubleshooting

### Database Connection Errors
- Verify PostgreSQL is running
- Check .env database credentials
- Ensure database exists

### Email Not Sending
- Verify SMTP credentials
- Check firewall/network settings
- Enable "Less secure apps" for Gmail
- Use app-specific password for Gmail

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

## License

All rights reserved - SOFTCELL Solutions
