# System Architecture Overview

This document provides a high-level overview of the proposed system architecture for MedRouter.

## Core Components

MedRouter will be designed with a modern, decoupled architecture consisting of a frontend client, a backend API, a database, and integrations with Language Models (LLMs).

1.  **Frontend (Client-Side)**:
    *   **Technology Choice**: React.js or Vue.js (To be finalized, both offer robust ecosystems for building interactive UIs).
        *   **Rationale**: Both are component-based, facilitate state management, and have strong community support, suitable for creating the minimalistic chat interface and doctor's panel.
    *   **Responsibilities**:
        *   User interface and experience (chat, file uploads, doctor's queue).
        *   Client-side state management.
        *   Communicating with the backend API via HTTP requests.
        *   Handling JWT access tokens for authenticated sessions.

2.  **Backend (Server-Side)**:
    *   **Technology Choice**: Node.js with Express.js or Django (Python) (To be finalized).
        *   **Node.js/Express.js Rationale**: Efficient for I/O-bound operations, JavaScript ecosystem (consistency if React/Vue is chosen), good for real-time communication (chat).
        *   **Django Rationale**: Robust framework with "batteries-included" (ORM, admin panel), Python's strength in data processing and AI/ML integration.
    *   **Responsibilities**:
        *   **API Gateway**: Single entry point for all client requests. Routes requests to appropriate services/modules. (May be a dedicated service or part of the main backend application).
        *   **Authentication Service**: Manages user registration, login, JWT issuance, and validation.
        *   **Role-Based Access Control (RBAC)**: Enforces permissions based on user roles.
        *   **Business Logic**:
            *   Managing patient cases (creation, status updates).
            *   Orchestrating calls to LLMs.
            *   **Data Processing Module**: Compiling data from LLMs. (Singleton Pattern)
            *   **Report Generation Module**: Creating patient and doctor reports. (Factory Pattern)
        *   Interacting with the database.
        *   Managing chat communications.

3.  **Database**:
    *   **Technology Choice**: PostgreSQL or MongoDB (To be finalized).
        *   **PostgreSQL Rationale**: Relational database, strong data integrity, ACID compliance, good for structured data like user profiles and case metadata. JSONB support allows for flexible storage of things like chat history or LLM outputs.
        *   **MongoDB Rationale**: NoSQL document database, flexible schema, good for evolving data structures like chat messages and diverse patient data. Scales horizontally well.
    *   **Responsibilities**:
        *   Storing user data (profiles, credentials).
        *   Storing patient case information (metadata, status, references to data, reports).
        *   Storing chat logs.
        *   Storing LLM outputs (or references to where they are stored if they are large).

4.  **Language Model (LLM) Integration**:
    *   **MedGemma (via LMStudio)**:
        *   Hosted locally.
        *   The backend will communicate with MedGemma's API endpoint (exposed by LMStudio) for general medical text analysis.
    *   **Fine-tuned Mistral Model**:
        *   Accessed via its dedicated API (likely cloud-hosted or self-hosted with an API).
        *   Used for specialized medical image analysis.
    *   **API Interaction**: The backend will securely manage API keys and send/receive data from these LLM APIs.

## Design Patterns to be Utilized

*   **Factory Pattern**: For generating different types of reports (patient-facing, doctor-facing) from the same compiled data pool.
*   **Observer Pattern**: To notify doctors when new patient cases are added to their queue or when patients send new messages.
*   **Strategy Pattern**: To handle different types of data processing based on input type (text, images, PDFs), potentially directing data to different LLM processing flows.
*   **Singleton Pattern**: For modules like the API Gateway or the core Data Processing Module to ensure a single instance manages resources efficiently.

## Deployment View (High-Level)

*   **Containerization**: Docker will be used to containerize the frontend, backend, and potentially the database (for development/testing) and local LLMs. This ensures consistency across environments.
*   **Environments**: Separate development, staging, and production environments.
*   **CI/CD**: A CI/CD pipeline (e.g., GitHub Actions, Jenkins) for automated testing and deployment.

## Scalability and Reliability

*   The backend will be designed to be stateless where possible, allowing for horizontal scaling.
*   The database choice will consider scalability needs.
*   Monitoring and logging will be crucial (Prometheus, Grafana, ELK Stack).

This architecture provides a flexible and scalable foundation for MedRouter. Specific choices within the technology stack (e.g., React vs. Vue, Node.js vs. Django) will be finalized based on further detailed requirements and team expertise.
```
