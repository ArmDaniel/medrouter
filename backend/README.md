# MedRouter Backend

This directory contains the backend server for the MedRouter application, built with Node.js and Express.js.

## Prerequisites

*   **Node.js**: Version 16.x or higher. (Check with `node -v`)
*   **npm**: Usually comes with Node.js. (Check with `npm -v`)
*   **PostgreSQL**: A running PostgreSQL instance (Version 13+ recommended for `gen_random_uuid()`).
    *   You will need to create a database and a user for MedRouter.

## Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone <repository_url>
    cd <repository_directory>/backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    *   Create a `.env` file in the `backend` directory by copying the example or creating it manually:
        ```bash
        cp .env.example .env
        ```
        (Note: We haven't created `.env.example` yet. For now, create `.env` manually based on the required variables.)
    *   Edit the `.env` file with your specific configurations:
        ```
        NODE_ENV=development
        PORT=3000

        # Database Configuration
        DB_USER=your_db_user          # e.g., medrouter_user
        DB_HOST=your_db_host          # e.g., localhost
        DB_NAME=your_db_name          # e.g., medrouter_db
        DB_PASSWORD=your_db_password    # e.g., securepassword
        DB_PORT=your_db_port          # e.g., 5432 (default for PostgreSQL)

        # JWT Secrets (Use strong, unique random strings)
        JWT_SECRET='your-super-secret-jwt-key-for-access-tokens'
        JWT_REFRESH_SECRET='your-super-secret-jwt-key-for-refresh-tokens'
        ACCESS_TOKEN_EXPIRES_IN='15m'
        REFRESH_TOKEN_EXPIRES_IN='7d'
        ```
    *   **Important**: Replace placeholder values (like `your_db_user`, JWT secrets) with your actual credentials and strong random secrets.

4.  **Database Setup**:
    *   Ensure your PostgreSQL server is running.
    *   Connect to PostgreSQL (e.g., using `psql`) and create the database and user specified in your `.env` file.
        ```sql
        CREATE DATABASE medrouter_db;
        CREATE USER medrouter_user WITH PASSWORD 'securepassword';
        GRANT ALL PRIVILEGES ON DATABASE medrouter_db TO medrouter_user;
        -- If using gen_random_uuid() on PG < 13, you might need to install the "uuid-ossp" extension:
        -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        -- (Connect to your database first: \c medrouter_db)
        ```
    *   Initialize the database schema (creates the 'users' table):
        ```bash
        node src/scripts/initializeDb.js
        ```
        (This script currently creates the `users` and `patient_cases` tables. Future migrations/scripts will handle other tables if needed.)

5.  **Run the Application**:
    *   For development with auto-reloading (using `nodemon`):
        ```bash
        # npm run dev (actual command)
        npm run dev-script
        ```
    *   To run in production mode (though more setup like a process manager e.g., PM2 would be needed for a real production deployment):
        ```bash
        # npm start (actual command)
        npm run start-script
        ```
    *   The server should start, typically on `http://localhost:3000` (or the `PORT` specified in `.env`).

## API Endpoints

The API is structured as follows:

*   `/api/auth`: Authentication (register, login, refresh token)
*   `/api/users`: User-specific information (e.g., `/me`, role-based dashboards)
*   `/api/cases`: Patient case management (create, view, assign doctor, add chat, process data, generate reports)
*   `/api/llm`: LLM interactions (currently placeholder, to be integrated with data processing for cases)

(More detailed API documentation will be provided separately, e.g., using Swagger/OpenAPI).

## Project Structure

*   `src/`: Contains the core application code.
    *   `config/`: Database and other configurations.
    *   `controllers/`: Request handlers.
    *   `middlewares/`: Custom middleware (e.g., auth, RBAC).
    *   `models/`: Database models/schemas.
    *   `routes/`: API route definitions.
    *   `services/`: Business logic services (e.g., data processing, report generation).
    *   `scripts/`: Utility scripts (e.g., database initialization).
    *   `app.js`: Express application setup.
    *   `index.js`: Server entry point.
*   `.env`: Environment variables (ignored by Git).
*   `README.md`: This file.

## Contributing

(Guidelines for contributing to be added later.)
