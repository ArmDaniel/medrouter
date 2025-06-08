# MedRouter - Full Application

This repository contains the MedRouter application, a medical platform for processing patient data using LLMs.

## Running the Full Application with Docker Compose (Recommended)

This is the easiest way to get the entire MedRouter application (backend, frontend, and database) up and running for development.

### Prerequisites

*   **Docker and Docker Compose**: Ensure they are installed on your system.
*   **Environment Files**:
    *   **Root \`.env\` file**: Create a \`.env\` file in this project root directory. It's primarily used to provide credentials for the PostgreSQL database service in \`docker-compose.yml\`. Example:
        \`\`\`env
        # Root .env for Docker Compose
        DB_USER=medrouter_user
        DB_PASSWORD=supersecurepassword
        DB_NAME=medrouter_db
        \`\`\`
        *(Note: Use strong, unique passwords in a real environment.)*
    *   **Backend \`.env\` file**: Ensure \`backend/.env\` exists and is configured. Key settings for Docker Compose:
        *   \`DB_HOST=database\` (to connect to the PostgreSQL container)
        *   \`DB_PORT=5432\`
        *   Other variables like \`JWT_SECRET\`, \`PORT\` (e.g., 3000).
    *   **Frontend \`.env\` file**: While \`REACT_APP_API_URL\` is set by Docker Compose for the container, a \`frontend/.env\` file might still be useful for local development outside Docker or for other frontend-specific variables. For Docker, the \`docker-compose.yml\` sets \`REACT_APP_API_URL=http://backend:3000/api\`.

### Steps to Run

1.  **Clone the Repository** (if you haven't already):
    \`\`\`bash
    git clone <repository_url>
    cd medrouter
    \`\`\`

2.  **Set up Environment Files**:
    *   Create or verify the root \`.env\` file as described above.
    *   Verify \`backend/.env\` and \`frontend/.env\` (especially for local non-Docker runs, but good to have).

3.  **Build and Run with Docker Compose**:
    From the project root directory (where \`docker-compose.yml\` is located):
    \`\`\`bash
    docker-compose up --build
    \`\`\`
    *   The \`--build\` flag ensures images are built if they don't exist or if Dockerfiles have changed.
    *   This will start the backend, frontend, and database services.

4.  **Accessing the Application**:
    *   **Frontend**: \`http://localhost:3001\` (or as configured in \`docker-compose.yml\`)
    *   **Backend API**: \`http://localhost:3000\` (or as configured)
    *   **Database (from host, for tools like pgAdmin)**: Connect to \`localhost:54320\` (or the host port mapped to PostgreSQL in \`docker-compose.yml\`) using the credentials from your root \`.env\` file.

5.  **Database Initialization**:
    *   The first time you run the application, the database tables (\`users\`, \`patient_cases\`) need to be created.
    *   Once the services are up and the database is healthy (check \`docker-compose logs database\`), run the initialization script **inside the backend container**:
        \`\`\`bash
        docker-compose exec backend node src/scripts/initializeDb.js
        \`\`\`

6.  **Stopping the Application**:
    *   Press \`Ctrl+C\` in the terminal where \`docker-compose up\` is running.
    *   To remove containers and the network:
        \`\`\`bash
        docker-compose down
        \`\`\`
        (Named volumes like \`postgres_data\` will persist unless explicitly removed.)

### Services Overview

The \`docker-compose.yml\` defines the following services:

*   \`backend\`: The Node.js/Express.js backend API.
*   \`frontend\`: The React.js frontend application.
*   \`database\`: The PostgreSQL database server.

These services are configured to work together on a shared Docker network.

---

# MedRouter

MedRouter is a medical application that processes patient data using two different language models (LLMs) to provide comprehensive medical analysis and reports. The application will have role-based permissions for patients and doctors, a secure authentication mechanism, and a minimalistic chat interface.

## Project Planning and Design Documents

The initial planning and design documents for MedRouter can be found in the `/docs` directory:

*   **[User Roles and Permissions](./docs/user_roles_and_permissions.md)**: Defines user roles (Patient, Doctor) and their permissions.
*   **[Data Flow](./docs/data_flow.md)**: Maps the flow of data from patient input to report generation.
*   **[Authentication and Data Protection](./docs/authentication_and_data_protection.md)**: Outlines security mechanisms, including authentication (JWT) and data protection strategies (HIPAA/GDPR compliance).
*   **[System Architecture](./docs/system_architecture.md)**: Describes the high-level system architecture, including frontend, backend, database, and LLM integrations.

---
# medrouter
an application that uses MedGemma and Mistral fine tuned models for preliminary medical screening and routing patients to appropriate medical specialists alongside a full medical report and possible issues

## Testing Strategies

Comprehensive testing is crucial for ensuring the reliability, functionality, and security of MedRouter. The following documents outline our testing strategies:

*   **[End-to-End (E2E) Data Flow Testing Strategy](./docs/testing/e2e_data_flow_testing_strategy.md)**: Details the approach for validating the complete data pipeline from patient input to report generation and access.
*   **[Security Testing Strategy](./docs/testing/security_testing_strategy.md)**: Outlines areas and methods for testing the security of the application, including authentication, authorization, data protection, and compliance considerations.

*(Specific test plans and reports will be developed based on these strategies as features are implemented and stabilized.)*
