# Backend API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All admin endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Get token via `/auth/login` endpoint.

## Public Endpoints

### Pages
```
GET  /pages              # Get all pages
GET  /pages/:slug        # Get page by slug
```

### Products
```
GET  /products           # Get all products
GET  /products/:id       # Get product by ID
```

### Services
```
GET  /services           # Get all services
GET  /services/:id       # Get service by ID
```

### Clients
```
GET  /clients            # Get all clients
GET  /clients/featured   # Get featured clients only
GET  /clients/:id        # Get client by ID
```

### Team
```
GET  /team               # Get all team members
GET  /team/:id           # Get team member by ID
```

### ISO Certificates
```
GET  /iso                # Get all certificates
GET  /iso/featured       # Get featured certificates
GET  /iso/:id            # Get certificate by ID
```

### Blog
```
GET  /blog/posts         # Get all blog posts
GET  /blog/posts/:slug   # Get post by slug
GET  /blog/categories    # Get all categories
```

### Settings
```
GET  /settings           # Get all settings
```

### Contact Form
```
POST /contact            # Submit contact form
Body: {
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
}
```

### Newsletter
```
POST /newsletter/subscribe
Body: { email: string }

POST /newsletter/unsubscribe
Body: { email: string }
```

## Protected Admin Endpoints

### Authentication
```
POST /auth/login
Body: { email: string, password: string }
Response: { token: string, user: {...} }

POST /auth/change-password
Body: { oldPassword: string, newPassword: string }

GET /auth/me             # Get current user info
```

### Products (CRUD)
```
POST   /products         # Create product
PUT    /products/:id     # Update product
DELETE /products/:id     # Delete product
```

### Services (CRUD)
```
POST   /services         # Create service
PUT    /services/:id     # Update service
DELETE /services/:id     # Delete service
```

### Clients (CRUD)
```
POST   /clients          # Create client
PUT    /clients/:id      # Update client
DELETE /clients/:id      # Delete client
```

### Team (CRUD)
```
POST   /team             # Create team member
PUT    /team/:id         # Update team member
DELETE /team/:id         # Delete team member
```

### ISO Certificates (CRUD)
```
POST   /iso              # Create certificate
PUT    /iso/:id          # Update certificate
DELETE /iso/:id          # Delete certificate
```

### Blog Posts
```
POST   /blog/posts       # Create post
PUT    /blog/posts/:id   # Update post
DELETE /blog/posts/:id   # Delete post
```

### Blog Categories
```
POST   /blog/categories  # Create category
DELETE /blog/categories/:id # Delete category
```

### Contact Submissions
```
GET    /contact          # Get all submissions
GET    /contact/:id      # Get submission by ID
PATCH  /contact/:id/read # Mark as read
DELETE /contact/:id      # Delete submission
```

### Newsletter
```
GET    /newsletter       # Get all subscribers
POST   /newsletter/send  # Send newsletter campaign
DELETE /newsletter/:id   # Delete subscriber
```

### Settings
```
PUT    /settings/:key    # Update single setting
POST   /settings/batch   # Update multiple settings
```

## Response Format

Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

Currently no rate limiting. Can be added via middleware.

## CORS

Configured to allow requests from `http://localhost:3000` in development.

## Data Validation

All endpoints validate input data and return validation errors with 400 status code.

Example validation error:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is invalid",
    "name": "Name is required"
  }
}
```

## File Upload

Currently no file upload endpoints. Images are managed via URL fields.

For file uploads:
1. Use a service like AWS S3 or Cloudinary
2. Add upload endpoint
3. Store file URLs in database

## Pagination

Not yet implemented. Can be added to GET endpoints:
- `?page=1`
- `?limit=10`
- `?sort=name`
- `?order=asc`

## Testing Endpoints

Use tools like:
- Postman
- Insomnia
- Thunder Client
- cURL

Example with cURL:
```bash
# Get products
curl http://localhost:3001/api/products

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@softcell.com","password":"admin@123"}'

# Create product (with token)
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product Name"...}'
```

## Need Help?

- Check environment variables in `.env`
- Verify backend is running on port 3001
- Check database connection
- Review error messages in server logs
