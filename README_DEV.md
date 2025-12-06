# MedRouter - Developer Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Development Workflow](#development-workflow)

## Overview

MedRouter is a full-stack medical application that processes patient data using two different language models (LLMs):
- **MedGemma**: For text analysis and symptom processing
- **Mistral**: For medical image analysis

The application features:
- Role-based access control (Patient and Doctor roles)
- Secure authentication with JWT
- Real-time chat between patients and doctors
- Case management system
- Automated report generation

**Tech Stack:**
- **Backend**: Node.js + Express.js + PostgreSQL
- **Frontend**: React.js + Zustand (state management)
- **Container**: Docker + Docker Compose
- **Database**: PostgreSQL 13+

## Prerequisites

### Required Software
- **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
- **npm**: v7.x or higher (comes with Node.js)
- **PostgreSQL**: v13 or higher ([Download](https://www.postgresql.org/download/))
- **Docker & Docker Compose**: For containerized setup ([Download](https://www.docker.com/products/docker-desktop))

### Optional but Recommended
- **LM Studio**: For running MedGemma locally ([Download](https://lmstudio.ai/))
- **pgAdmin**: For database management ([Download](https://www.pgadmin.org/))
- **Postman** or **Insomnia**: For API testing

## Quick Start

The fastest way to get MedRouter running:

```bash
# 1. Clone the repository
git clone <repository_url>
cd medrouter

# 2. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env with your database credentials and JWT secrets

# 3. Start with Docker Compose (recommended)
docker-compose up --build

# 4. Initialize the database (in a new terminal)
docker-compose exec backend node src/scripts/initializeDb.js

# 5. Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
```

## Development Setup

### Option 1: Docker Compose (Recommended)

Docker Compose provides an isolated, reproducible environment with all services configured.

#### Step 1: Environment Files

Create a `.env` file in the **project root** for database credentials:

```bash
# Root .env
DB_USER=medrouter_user
DB_PASSWORD=supersecurepassword
DB_NAME=medrouter_db
```

Configure `backend/.env`:

```bash
NODE_ENV=development
PORT=3000

# Database Configuration (for Docker)
DB_USER=medrouter_user
DB_HOST=database  # Docker service name
DB_NAME=medrouter_db
DB_PASSWORD=supersecurepassword
DB_PORT=5432

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# LLM Integration
MEDGEMMA_API_URL=http://host.docker.internal:1234/v1/chat/completions
MISTRAL_IMAGE_API_URL=https://api.mistral.ai/v1/images/analyze
MISTRAL_IMAGE_API_KEY=your_mistral_api_key_here
```

Configure `frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:3000/api
```

#### Step 2: Start Services

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build
```

#### Step 3: Initialize Database

```bash
# Wait for database to be healthy, then run:
docker-compose exec backend node src/scripts/initializeDb.js
```

#### Step 4: Verify Services

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:54320 (from host machine)

### Option 2: Local Development (Without Docker)

For faster iteration during active development.

#### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### Step 2: Database Setup

Ensure PostgreSQL is running locally:

```bash
# Start PostgreSQL (varies by OS)
# macOS (via Homebrew):
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows: Use pgAdmin or Services panel
```

Create database and user:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create user and database
CREATE USER medrouter_user WITH PASSWORD 'supersecurepassword';
CREATE DATABASE medrouter_db OWNER medrouter_user;
GRANT ALL PRIVILEGES ON DATABASE medrouter_db TO medrouter_user;
```

#### Step 3: Configure Environment

Create `backend/.env`:

```bash
NODE_ENV=development
PORT=3000

# Database Configuration (for local PostgreSQL)
DB_USER=medrouter_user
DB_HOST=localhost  # NOT 'database' for local dev
DB_NAME=medrouter_db
DB_PASSWORD=supersecurepassword
DB_PORT=5432

# JWT Secrets (generate strong random strings)
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# LLM Integration
MEDGEMMA_API_URL=http://localhost:1234/v1/chat/completions
MISTRAL_IMAGE_API_URL=https://api.mistral.ai/v1/images/analyze
MISTRAL_IMAGE_API_KEY=your_mistral_api_key_here
```

Create `frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:3000/api
```

#### Step 4: Initialize Database Schema

```bash
cd backend
node src/scripts/initializeDb.js
```

#### Step 5: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start  # React dev server
```

## Architecture Overview

### Backend Structure

```
backend/src/
├── app.js                    # Express app configuration
├── index.js                  # Server entry point
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controllers/             # Request handlers
│   ├── authController.js    # Authentication logic
│   ├── caseController.js    # Case management
│   ├── llmController.js     # LLM interactions
│   └── userController.js    # User management
├── middlewares/
│   └── authMiddleware.js    # JWT verification
├── models/                  # Database models
│   ├── UserModel.js         # User CRUD operations
│   └── CaseModel.js         # Case CRUD operations
├── routes/                  # API route definitions
│   ├── authRoutes.js
│   ├── caseRoutes.js
│   ├── llmRoutes.js
│   └── userRoutes.js
├── services/                # Business logic
│   ├── dataProcessingService.js  # Orchestrates LLM calls
│   └── reportGenerationService.js # Report generation
├── llm_adapters/            # LLM integrations (modular)
│   ├── medGemmaAdapter.js   # MedGemma text analysis
│   └── mistralAdapter.js    # Mistral image analysis
└── scripts/
    └── initializeDb.js      # Database initialization
```

### Frontend Structure

```
frontend/src/
├── App.js                   # Main app component with routing
├── index.js                 # React entry point
├── components/              # Reusable UI components
│   ├── ChatInput.js
│   ├── ChatMessage.js
│   ├── MessageList.js
│   ├── FileUpload.js
│   ├── CaseListItem.js
│   └── ProtectedRoute.js
├── pages/                   # Page-level components
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── ChatPage.js
│   ├── DoctorDashboardPage.js
│   └── PatientFileUploadPage.js
├── services/                # API service layers
│   ├── authService.js
│   ├── caseService.js
│   ├── chatService.js
│   └── fileService.js
├── store/
│   └── authStore.js         # Zustand state management
└── assets/                  # Images, styles, etc.
```

### Data Flow

1. **Patient creates a case** → Stored in `patient_cases` table
2. **Patient selects a doctor** → Case is assigned (`doctorid` field updated)
3. **Doctor processes case** → Triggers LLM analysis via adapters
4. **LLM adapters** → Call MedGemma (text) and Mistral (images)
5. **Results compiled** → Stored in `data` JSONB field
6. **Doctor generates report** → Stored in `finalreport` field
7. **Patient views report** → Retrieved via API

## Running the Application

### Starting Services

**With Docker:**
```bash
docker-compose up          # With logs
docker-compose up -d       # Detached mode
```

**Without Docker:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm start
```

### Stopping Services

**With Docker:**
```bash
docker-compose down        # Stop and remove containers
docker-compose down -v     # Also remove volumes (deletes DB data!)
```

**Without Docker:**
```bash
# Press Ctrl+C in each terminal
```

### Viewing Logs

**With Docker:**
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only
docker-compose logs -f database     # Database only
```

### Accessing Services

- **Frontend UI**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Database** (from host): localhost:54320
  - Use credentials from root `.env` file
  - Connect with pgAdmin or any PostgreSQL client

### Database Management

**Reset database:**
```bash
# With Docker
docker-compose down -v
docker-compose up -d database
docker-compose exec backend node src/scripts/initializeDb.js

# Without Docker
psql -U postgres -c "DROP DATABASE medrouter_db;"
psql -U postgres -c "CREATE DATABASE medrouter_db OWNER medrouter_user;"
cd backend && node src/scripts/initializeDb.js
```

**Access database shell:**
```bash
# With Docker
docker-compose exec database psql -U medrouter_user -d medrouter_db

# Without Docker
psql -U medrouter_user -d medrouter_db
```

## Testing

### Manual API Testing

Use curl, Postman, or Insomnia to test endpoints:

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Patient",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Create a case (requires auth token):**
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "initialInput": {
      "text": "I have been experiencing headaches for 2 days",
      "files": []
    }
  }'
```

### Frontend Testing

1. Register as a Patient
2. Register as a Doctor (use different email)
3. Create a case as Patient
4. Select a doctor for the case
5. Test chat functionality
6. As Doctor, process the case data
7. Generate and view reports

### Automated Tests

Currently, no automated tests are implemented. Consider adding:
- Unit tests with Jest
- Integration tests for API endpoints
- E2E tests with Cypress or Playwright

## Common Issues & Troubleshooting

### Backend Won't Start

**Error: `ECONNREFUSED` connecting to database**

**Solution:**
- Verify PostgreSQL is running: `docker-compose ps` or `pg_isready -h localhost`
- Check `DB_HOST` in `backend/.env`:
  - Docker: `DB_HOST=database`
  - Local: `DB_HOST=localhost`
- Ensure database credentials match in `.env` files

**Error: `JWT_SECRET is not defined`**

**Solution:**
- Ensure `backend/.env` has `JWT_SECRET` and `JWT_REFRESH_SECRET` set
- Restart backend after adding environment variables

### Frontend Build Issues

**Error: `Module not found: Can't resolve './ChatPage.module.css'`**

**Solution:**
- Some components reference CSS modules that may not exist
- Create missing CSS module files or remove the import

**Error: `REACT_APP_API_URL is undefined`**

**Solution:**
- Ensure `frontend/.env` contains `REACT_APP_API_URL=http://localhost:3000/api`
- Restart frontend dev server (environment variables are only loaded at startup)

### Docker Issues

**Error: `port is already allocated`**

**Solution:**
```bash
# Find what's using the port
lsof -i :3000  # or :3001, :54320
# Kill the process or change ports in docker-compose.yml
```

**Error: `Cannot connect to Docker daemon`**

**Solution:**
- Ensure Docker Desktop is running
- On Linux, ensure your user is in the `docker` group: `sudo usermod -aG docker $USER`

**Container keeps restarting:**

**Solution:**
```bash
# Check logs for errors
docker-compose logs backend
# Common issues: missing env vars, database connection failures
```

### Database Issues

**Tables not created:**

**Solution:**
```bash
# Run initialization script
docker-compose exec backend node src/scripts/initializeDb.js
```

**Error: `relation "users" does not exist`**

**Solution:**
- Database schema not initialized
- Run `node src/scripts/initializeDb.js`

**Permission denied on database:**

**Solution:**
```sql
-- Connect as postgres superuser
psql -U postgres
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE medrouter_db TO medrouter_user;
```

### LLM Integration Issues

**MedGemma not responding:**

**Solution:**
- Ensure LM Studio (or similar) is running on port 1234
- Check `MEDGEMMA_API_URL` in `backend/.env`
- For Docker, use `http://host.docker.internal:1234/v1/chat/completions`
- For local dev, use `http://localhost:1234/v1/chat/completions`
- Test endpoint: `curl http://localhost:1234/v1/models`

**Mistral Image API errors:**

**Solution:**
- Verify `MISTRAL_IMAGE_API_KEY` is set correctly
- Check API quota/billing status
- Review Mistral API documentation for endpoint changes

### Authentication Issues

**Token expired errors:**

**Solution:**
- Tokens have limited lifetime (default: 15 minutes for access, 7 days for refresh)
- Implement token refresh logic or login again
- Adjust `ACCESS_TOKEN_EXPIRES_IN` in `backend/.env` for development

**403 Forbidden errors:**

**Solution:**
- Verify user role matches required role for endpoint
- Check `protect` and `authorize` middleware in routes
- Ensure JWT token is included in `Authorization: Bearer TOKEN` header

### CORS Issues

**Error: `CORS policy: No 'Access-Control-Allow-Origin' header`**

**Solution:**
- Backend needs to enable CORS for frontend origin
- Add CORS middleware to `backend/src/app.js`:
```javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3001' }));
```

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing patterns in the codebase
- Add comments for complex logic
- Use meaningful variable and function names

### Environment Variables

**Never commit sensitive data!**
- Keep `.env` files in `.gitignore`
- Use `.env.example` as templates
- Document all required variables

### Database Migrations

When modifying database schema:
1. Update table creation queries in `initializeDb.js`
2. Document changes in migration notes
3. Consider adding a migrations system (e.g., `node-pg-migrate`)

### Adding New LLM Adapters

To integrate a new LLM:

1. Create adapter in `backend/src/llm_adapters/`:
   ```javascript
   // newLlmAdapter.js
   const axios = require('axios');
   
   const newLlmAdapter = {
     analyze: async (input) => {
       // Implementation
       return {
         success: true/false,
         data: { /* processed results */ },
         rawResponse: { /* raw API response */ },
         error: null or "error message"
       };
     }
   };
   
   module.exports = newLlmAdapter;
   ```

2. Import in `dataProcessingService.js`
3. Add environment variables to `.env.example`
4. Update documentation

### Debugging Tips

**Backend debugging:**
```bash
# Use nodemon for auto-reload
npm run dev

# Add debug logs
console.log('[DEBUG]', variableName);
```

**Frontend debugging:**
- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log()` statements
- Inspect network tab for API calls

**Database debugging:**
```bash
# View table contents
docker-compose exec database psql -U medrouter_user -d medrouter_db -c "SELECT * FROM users;"

# Check if tables exist
docker-compose exec database psql -U medrouter_user -d medrouter_db -c "\dt"
```

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Getting Help

If you encounter issues not covered here:
1. Check existing GitHub issues
2. Review application logs
3. Consult the documentation in `/docs` directory
4. Create a new GitHub issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Relevant error messages/logs
