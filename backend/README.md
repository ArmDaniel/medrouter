# MedRouter Backend

This directory contains the backend server for the MedRouter application, built with Node.js and Express.js.

## Prerequisites

*   **Node.js**: Version 16.x or higher.
*   **npm**: Package manager.
*   **PostgreSQL**: A running PostgreSQL instance (Version 13+ recommended).

## Setup Instructions (Local Development without Docker)

1.  **Clone Repository & Navigate**:
    ```bash
    git clone <repository_url>
    cd <repository_directory>/backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables (`.env` file)**:
    *   Copy `backend/.env.example` to `backend/.env`.
    *   Update with your specific configurations:
        ```env
        NODE_ENV=development
        PORT=3000

        # Database Configuration
        DB_USER=your_db_user
        DB_HOST=localhost # For local PG
        DB_NAME=your_db_name
        DB_PASSWORD=your_db_password
        DB_PORT=5432

        # JWT Secrets
        JWT_SECRET='your_jwt_secret_access'
        JWT_REFRESH_SECRET='your_jwt_secret_refresh'
        ACCESS_TOKEN_EXPIRES_IN='15m'
        REFRESH_TOKEN_EXPIRES_IN='7d'

        # LLM Integration
        MEDGEMMA_API_URL=http://localhost:1234/v1/chat/completions # e.g., for LMStudio
        MISTRAL_IMAGE_API_URL=https://your_mistral_api.example.com/invoke # Replace with actual URL
        MISTRAL_IMAGE_API_KEY=your_mistral_api_key       # Replace with actual key
        ```

4.  **Database Setup**:
    *   Ensure PostgreSQL is running. Create the database and user as specified in `.env`.
    *   Initialize schema:
        ```bash
        node src/scripts/initializeDb.js
        ```

5.  **Run Application**:
    *   Development (with nodemon):
        ```bash
        # Actual command: npm run dev
        npm run dev-script
        ```
    *   Production:
        ```bash
        # Actual command: npm start
        npm run start-script
        ```
    *   Server typically at `http://localhost:3000`.

## API Endpoints

*   `/api/auth`: User authentication.
*   `/api/users`: User-specific data.
*   `/api/cases`: Case management (creation, assignment, chat, file uploads to `:caseId/files`, data processing, reports).
*   LLM interactions are handled internally by the `DataProcessingService` via adapters, not exposed as direct frontend-callable LLM endpoints.

## Project Structure Highlights

*   `src/`: Core application code.
    *   `llm_adapters/`: Contains modules for interacting with specific LLM services (e.g., `medGemmaAdapter.js`, `mistralAdapter.js`). This modular design allows for easier customization or replacement of LLM providers. Each adapter handles its own API communication and data transformation, conforming to a standardized response pattern.
    *   `services/DataProcessingService.js`: Orchestrates calls to LLM adapters and compiles their results.
    *   Other directories: `config`, `controllers`, `middlewares`, `models`, `routes`, `scripts`.
*   `.env`: Environment variables (gitignored).
*   `.env.example`: Template for environment variables.

## Running with Docker (Recommended for Development)

Provides a consistent environment for backend, frontend, and database.

1.  **Prerequisites**: Docker and Docker Compose.
2.  **Environment Files**:
    *   **Root `.env`**: For Docker Compose database credentials (see root `README.md`).
    *   **`backend/.env`**: Ensure this file exists. For Docker:
        *   `DB_HOST=database` (service name of PostgreSQL container).
        *   LLM variables (`MEDGEMMA_API_URL`, etc.) should point to URLs accessible from within the Docker network (e.g., `http://host.docker.internal:1234` for LMStudio running on host, or actual deployed URLs).

3.  **Run Services (from project root)**:
    ```bash
    docker-compose up --build
    ```
    *   Backend at `http://localhost:3000`.

4.  **Database Init (with Docker)**:
    After services are up, run from project root:
    ```bash
    docker-compose exec backend node src/scripts/initializeDb.js
    ```

5.  **Stop Services**: `Ctrl+C`, then `docker-compose down` from project root.

### LLM Integration Details

*   The backend integrates with MedGemma (via LMStudio or similar) for text analysis and a fine-tuned Mistral model for image analysis.
*   Configuration for these services (API URLs, keys) is managed via environment variables in `backend/.env`.
*   **LLM Adapters**: The interaction logic for each LLM is encapsulated in an "adapter" module within the `src/llm_adapters` directory. This design promotes modularity. To customize an LLM integration (e.g., change API endpoint, modify payload/response handling, or switch to a different provider for a similar task), you would primarily modify the corresponding adapter file.
*   **Accessibility**: Ensure the LLM services are network-accessible from where the backend is running (e.g., from the Docker container if using Docker, or from localhost if running locally).
*   **File Handling for Mistral**: The `mistralAdapter.js` currently includes placeholder logic to access image files from a local `uploads_placeholder` directory. For this to work correctly, the backend's file upload mechanism must store files in a location accessible to the adapter, and the adapter must be correctly configured with this path.

### Additional Dependencies

*   **form-data**: Used for `multipart/form-data` requests (Mistral image uploads). Included in `package.json`.
