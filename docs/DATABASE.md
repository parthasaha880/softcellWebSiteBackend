# Database Schema Documentation

## Overview

PostgreSQL database with TypeORM ORM. All entities are defined in `src/entities/index.ts`.

## Tables

### admin_users
Admin account management for the platform.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed with bcrypt |
| fullName | VARCHAR | Admin name |
| role | ENUM | 'admin' or 'editor' |
| lastLogin | TIMESTAMP | Last login time |
| createdAt | TIMESTAMP | Created timestamp |
| updatedAt | TIMESTAMP | Updated timestamp |

### pages
Website static and dynamic pages.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| title | VARCHAR | Page title |
| slug | VARCHAR | URL slug (unique) |
| content | TEXT | Page content/HTML |
| metaDescription | VARCHAR | SEO meta description |
| metaKeywords | VARCHAR | SEO keywords |
| isPublished | BOOLEAN | Publish status |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### products
Product listings with details.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Product name |
| slug | VARCHAR | URL slug |
| description | TEXT | Short description |
| longDescription | TEXT | Detailed description |
| imageUrl | VARCHAR | Product image URL |
| features | JSON | Array of features |
| price | DECIMAL | Product price |
| isPublished | BOOLEAN | Visibility |
| order | INT | Display order |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### services
Service offerings.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Service name |
| slug | VARCHAR | URL slug |
| description | TEXT | Service description |
| icon | VARCHAR | Icon name |
| imageUrl | VARCHAR | Service image |
| features | JSON | Array of features |
| isPublished | BOOLEAN | Visibility |
| order | INT | Display order |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### clients
Client/customer information.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Company name |
| slug | VARCHAR | URL slug |
| logoUrl | VARCHAR | Company logo URL |
| description | TEXT | About client |
| website | VARCHAR | Client website |
| isFeatured | BOOLEAN | Homepage display |
| order | INT | Display order |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### team_members
Team member profiles.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Full name |
| slug | VARCHAR | URL slug |
| position | VARCHAR | Job title |
| bio | TEXT | Biography |
| imageUrl | VARCHAR | Profile photo |
| expertise | JSON | Array of skills |
| social | JSON | Social media links |
| order | INT | Display order |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### iso_certificates
ISO certifications and achievements.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Certificate name |
| slug | VARCHAR | URL slug |
| description | TEXT | Details |
| certificateNumber | VARCHAR | Official number |
| issueDate | DATE | Issued date |
| expiryDate | DATE | Expiry date |
| imageUrl | VARCHAR | Certificate image |
| documentUrl | VARCHAR | PDF link |
| isFeatured | BOOLEAN | Homepage display |
| order | INT | Display order |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### blog_posts
Blog articles and news.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| title | VARCHAR | Post title |
| slug | VARCHAR | URL slug |
| excerpt | TEXT | Summary |
| content | TEXT | Full content |
| imageUrl | VARCHAR | Featured image |
| categories | JSON | Array of categories |
| author | VARCHAR | Author name |
| views | INT | View count |
| isPublished | BOOLEAN | Visibility |
| publishedAt | TIMESTAMP | Publish time |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### blog_categories
Blog post categories for organization.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Category name |
| slug | VARCHAR | URL slug |
| description | TEXT | Category description |
| order | INT | Display order |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### contact_submissions
Contact form submissions and inquiries.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Visitor name |
| email | VARCHAR | Email address |
| phone | VARCHAR | Phone number |
| subject | VARCHAR | Message subject |
| message | TEXT | Message content |
| ipAddress | VARCHAR | Visitor IP |
| isRead | BOOLEAN | Read status |
| response | TEXT | Admin response |
| respondedAt | TIMESTAMP | Response time |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### newsletter_subscribers
Newsletter subscription management.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR | Subscriber email |
| name | VARCHAR | Subscriber name |
| isActive | BOOLEAN | Subscription status |
| confirmedAt | TIMESTAMP | Confirmation time |
| unsubscribedAt | TIMESTAMP | Unsubscribe time |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### settings
Application configuration and settings.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| key | VARCHAR | Setting key |
| value | VARCHAR | Setting value |
| type | VARCHAR | 'string', 'number', 'boolean', 'json' |
| description | TEXT | Setting description |
| updatedAt | TIMESTAMP | Last updated |

## Relationships

- **admin_users** has many **contact_submissions** (via admin responses)
- **blog_posts** has many **blog_categories** (many-to-many via categories JSON)
- **newsletter_subscribers** is independent
- All entities have soft delete capability via **isPublished** or **isActive**

## Indexes

Created on frequently queried columns:
- `pages.slug`
- `products.slug`
- `services.slug`
- `blog_posts.slug`
- `team_members.name`
- `clients.name`
- `contact_submissions.email`
- `newsletter_subscribers.email`
- `admin_users.email`

## Seeding Data

Default seeded data includes:

**Admin User:**
```
Email: admin@softcell.com
Password: admin@123 (hashed)
```

**Sample Data:**
- 3 Products
- 4 Services
- 3 Clients
- 4 Team Members
- 3 ISO Certificates
- 5 Blog Posts
- 2 Blog Categories
- Default site settings

## Backup & Restore

### Backup Database
```bash
pg_dump -U postgres softcell_db > backup.sql
```

### Restore Database
```bash
psql -U postgres softcell_db < backup.sql
```

### Backup with Docker
```bash
docker exec <container_id> pg_dump -U postgres softcell_db > backup.sql
```

## Migrations (TypeORM)

Database synchronization is enabled in development:
```typescript
synchronize: true  // Auto-sync schema with entities
```

For production, use TypeORM migrations:
```bash
npm run migration:generate -- src/migrations/CreateUsersTable
npm run migration:run
```

## Connection Pooling

TypeORM pool settings in `data-source.ts`:
```typescript
extra: {
  max: 20,           // Max pool size
  min: 5,            // Min pool size
  idleTimeoutMillis: 30000
}
```

## Performance Optimization

### Indexes
- Unique indexes on email fields
- Composite indexes on frequently joined columns
- Partial indexes on published status

### Queries
- Use pagination for large datasets
- Eager load relations when needed
- Cache settings in memory

### Connections
- Connection pooling enabled
- Max 20 concurrent connections
- 30 second idle timeout

## Data Types Used

- **UUID** - Unique identifiers (generated)
- **VARCHAR** - Text strings
- **TEXT** - Long text content
- **JSON** - Structured data (arrays, objects)
- **BOOLEAN** - True/false values
- **DATE** - Date only (YYYY-MM-DD)
- **TIMESTAMP** - Date and time with timezone
- **INT** - Integer numbers
- **DECIMAL** - Decimal numbers (prices)
- **ENUM** - Fixed set of values

## Constraints

- **NOT NULL** - Required fields
- **UNIQUE** - Email, slug fields
- **DEFAULT** - Current timestamp, false for booleans
- **CHECK** - Enum validation

## Security

- Passwords hashed with bcrypt (12 rounds)
- SQL injection prevented by TypeORM (parameterized queries)
- Sensitive data not logged
- Environment variables for credentials

## Maintenance

### Regular Tasks

1. **Monthly:** Analyze query performance
```bash
ANALYZE;
```

2. **Quarterly:** Reindex tables
```bash
REINDEX DATABASE softcell_db;
```

3. **Yearly:** Vacuum and optimize
```bash
VACUUM ANALYZE;
```

### Monitoring

Monitor these metrics:
- Connection count
- Query execution time
- Disk space usage
- Index usage

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql -h localhost -U postgres -d softcell_db

# Check running queries
SELECT * FROM pg_stat_activity;
```

### Performance Issues
```bash
# Find slow queries
SELECT query, calls, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Disaster Recovery

### Emergency Backup
```bash
pg_dump --no-password -U postgres softcell_db | gzip > emergency_backup.sql.gz
```

### Point-in-Time Recovery
Use PostgreSQL WAL (Write-Ahead Logging) for recovery to any point in time.

Configure in `postgresql.conf`:
```
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/%f'
```

Then restore with:
```bash
pg_restore -d softcell_db /backup/softcell_db.dump --recovery-target-timeline=latest
```
