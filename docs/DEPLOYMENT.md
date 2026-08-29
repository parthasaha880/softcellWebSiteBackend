# Backend Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git
- PM2 (for process management) - optional
- Nginx (for reverse proxy) - optional

## Production Build

### 1. Build the Application

```bash
cd backend
npm install
npm run build
```

### 2. Set Environment Variables

Create `.env` file in production server:

```env
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=strong-password
DB_NAME=softcell_db
NODE_ENV=production
PORT=3001
JWT_SECRET=generate-a-very-long-random-string
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
CORS_ORIGIN=https://your-domain.com
```

### 3. Initialize Database

```bash
# Create database if not exists
createdb softcell_db

# Seed database
npm run seed
```

## Deployment Options

### Option 1: Manual Deployment with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd /path/to/backend
npm install --production
pm2 start npm --name "softcell-api" -- start

# Auto-restart on server reboot
pm2 startup
pm2 save
```

Monitor with:
```bash
pm2 monit
pm2 logs softcell-api
```

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t softcell-api .
docker run -d \
  -p 3001:3001 \
  -e DB_HOST=db \
  --link postgres:db \
  softcell-api
```

### Option 3: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create softcell-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set GMAIL_EMAIL=your-email
heroku config:set GMAIL_PASSWORD=your-password
heroku config:set CORS_ORIGIN=https://your-domain.com

# Deploy
git push heroku main
```

### Option 4: AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance.com

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone https://github.com/your-repo/softcell.git
cd softcell/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env

# Build and start
npm run build
npm start
```

## Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/softcell-api`:

```nginx
upstream softcell_api {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://softcell_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/softcell-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/HTTPS Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.your-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

Update Nginx config:

```nginx
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Backup Strategy

### Automated Daily Backup

Create backup script `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/softcell_db_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U postgres softcell_db | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Schedule with cron:

```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-db.sh
```

### Remote Backup

```bash
# Upload to AWS S3
aws s3 cp $BACKUP_FILE s3://your-bucket/backups/
```

## Monitoring & Logging

### Application Logs

With PM2:
```bash
pm2 logs softcell-api
```

With Docker:
```bash
docker logs -f container-id
```

### System Monitoring

```bash
# CPU & Memory
top

# Disk usage
df -h

# PostgreSQL performance
sudo -u postgres psql -d softcell_db -c "\dt+"
```

### Alert Setup

Use services like:
- Sentry for error tracking
- New Relic for performance monitoring
- DataDog for infrastructure monitoring

## Performance Optimization

### 1. Enable Compression

In Nginx:
```nginx
gzip on;
gzip_types application/json text/plain;
gzip_min_length 1000;
```

### 2. Connection Pooling

Already configured in TypeORM:
```typescript
extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000
}
```

### 3. Caching Headers

Set in API:
```typescript
res.set('Cache-Control', 'public, max-age=3600');
```

### 4. Database Indexing

Already created on common fields:
- emails
- slugs
- published status

## Security Hardening

### 1. Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3001       # Close direct access
```

### 2. Secrets Management

Use environment variables (not in code):
```bash
# Never commit .env files
git config core.hooksPath .githooks
```

### 3. Rate Limiting

Add to API:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 4. CORS Configuration

Set to production domain:
```typescript
cors({
  origin: 'https://your-domain.com',
  credentials: true
})
```

## Health Checks

Add health endpoint:

```typescript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

Monitor with:
```bash
curl https://api.your-domain.com/api/health
```

## Rollback Procedure

Keep previous versions:

```bash
# Deploy new version with tag
git tag v1.1.0
git push origin v1.1.0

# If issues, checkout previous
git checkout v1.0.0
npm run build && npm start
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backed up
- [ ] Security patches applied
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Application tested
- [ ] Monitoring enabled
- [ ] Logging configured
- [ ] Health check working
- [ ] Admin credentials changed

## Support & Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs softcell-api

# Check port
lsof -i :3001
```

### Database connection fails
```bash
# Test connection
psql -h host -U user -d softcell_db

# Check PostgreSQL running
sudo systemctl status postgresql
```

### Performance issues
```bash
# Check queries
sudo -u postgres psql -d softcell_db
\dt+  # Table sizes
```

## Next Steps

1. Test thoroughly in staging
2. Plan maintenance window
3. Execute deployment
4. Monitor for 24 hours
5. Document any issues

For frontend deployment, see [Frontend Deployment](../../frontend/docs/DEPLOYMENT.md)
