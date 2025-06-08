# MedRouter Frontend

This directory contains the frontend application for MedRouter, built with React.js.

## Prerequisites

*   **Node.js**: Version 16.x or higher (aligned with backend, though React itself can be flexible).
*   **npm** or **yarn**: Package manager. This guide will use npm.

## Setup Instructions

1.  **Navigate to Frontend Directory**:
    If you've cloned the entire MedRouter repository, navigate to the frontend directory:
    ```bash
    cd path/to/medrouter/frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    (If you prefer yarn: `yarn install`)

3.  **Configure Environment Variables**:
    *   The frontend uses a `.env` file to configure the backend API URL.
    *   If it doesn't exist, create a `.env` file in the `frontend` directory:
        ```bash
        cp .env.example .env  # If .env.example exists
        # Or create it manually:
        # touch .env
        ```
    *   Add the following variable, pointing to your running backend API:
        ```
        REACT_APP_API_URL=http://localhost:3000/api
        ```
        (Adjust the URL if your backend is running on a different port or host.)

4.  **Ensure Backend is Running**:
    *   The frontend application needs to communicate with the MedRouter backend. Make sure the backend server is running. Refer to the `backend/README.md` for instructions on running the backend.

5.  **Run the Application**:
    ```bash
    # npm start (actual command)
    npm run start-script
    ```
    (If you prefer yarn: `yarn start`)
    *   This will start the React development server, usually on `http://localhost:3001` (Create React App often defaults to a port other than 3000 if it's in use). Check your terminal output for the exact URL.
    *   The application will open in your default web browser.

## Project Structure (Inside `frontend/src`)

*   `App.js`: Main application component, sets up routing.
*   `index.js`: Entry point of the React application.
*   `index.css`: Global stylesheets.
*   `components/`: Reusable UI components (e.g., `ProtectedRoute.js`).
*   `pages/`: Top-level components for different routes/views (e.g., `LoginPage.js`, `ChatPage.js`).
*   `services/`: Modules for API interactions (e.g., `authService.js`).
*   `store/`: State management logic using Zustand (e.g., `authStore.js`).
*   `contexts/`: React Context API providers and consumers (if used).
*   `hooks/`: Custom React hooks.
*   `assets/`: Static assets like images, fonts (if any).

## Available Scripts

In the project directory, you can run:

*   `npm run start-script`: Runs the app in development mode. (Actual: npm start)
*   `npm test`: Launches the test runner in interactive watch mode. (Tests need to be written)
*   `npm run build`: Builds the app for production to the `build` folder.
*   `npm run eject`: Removes the single build dependency from your project (use with caution).

## Key Dependencies

*   **React Router DOM**: For client-side routing.
*   **Axios**: For making HTTP requests to the backend API.
*   **Zustand**: For simple state management.

## Next Steps (Development Focus)

*   Implement the chat interface.
*   Implement file upload functionality for patients.
*   Develop the doctor's panel for managing patient cases.
*   Refine UI/UX.
## Running with Docker (Recommended for Development)

This frontend service can be run as part of a multi-container setup using Docker Compose, located in the project root.

1.  **Prerequisites**:
    *   Docker and Docker Compose installed.
    *   The MedRouter backend service should be running (either locally or as part of the same Docker Compose setup).

2.  **Environment Variables for Docker**:
    *   When running via the root `docker-compose.yml`:
        *   `REACT_APP_API_URL`: This is automatically set in the `docker-compose.yml` to point to the backend service (e.g., `http://backend:3000/api`). You generally don't need to set this in the `frontend/.env` file if you are *only* using Docker Compose.
        *   `PORT`: The `docker-compose.yml` also sets the `PORT` for the container (e.g., to 3001), which the React development server should respect.
    *   If you have a `frontend/.env` file, variables defined there might be used by the local `npm start` but could be overridden by the `environment` section in `docker-compose.yml` for the Docker container. For Docker Compose, the settings in `docker-compose.yml` are typically authoritative for inter-container communication.

3.  **Running the Services**:
    *   Navigate to the **project root directory** (the one containing `docker-compose.yml`).
    *   Run the following command:
        ```bash
        docker-compose up --build
        ```
    *   This will build images for all services (if not already built) and start them.
    *   The frontend service will be accessible on the host at the port mapped in `docker-compose.yml` (e.g., `http://localhost:3001`).
    *   Logs for the frontend can be viewed in the terminal output from `docker-compose up`, or by running `docker-compose logs frontend`.

4.  **Hot Reloading**:
    *   The `docker-compose.yml` mounts the frontend source code into the container.
    *   The `CHOKIDAR_USEPOLLING=true` environment variable is often set in `docker-compose.yml` for the frontend service to help ensure hot reloading works reliably within Docker across different operating systems.

5.  **Stopping the Services**:
    *   Press `Ctrl+C` in the terminal where `docker-compose up` is running.
    *   To remove the containers:
        ```bash
        docker-compose down
        ```


### Chat Interface

*   A basic chat interface has been implemented and can be accessed via the `/chat` route (requires login, typically as a Patient for the current setup).
*   It allows users to view messages and send new messages for a case.
*   **Note**: Currently, the `ChatPage.js` uses a hardcoded case ID (`test-case-123`) for demonstration purposes. This will be made dynamic in future updates (e.g., when case selection is implemented).
*   Features include:
    *   Display of messages, differentiating between the current user's messages and others.
    *   A scrollable message list that automatically scrolls to the latest message.
    *   An input field and send button for composing and sending new messages.
*   The interface is built using components like `ChatMessage`, `MessageList`, and `ChatInput`, with styling provided by CSS Modules.
*   Backend communication for chat functionalities is handled by the `services/chatService.js`.


### File Upload Functionality

*   Patients can upload files (e.g., medical documents, images) via the `/upload-files` route (requires login as a Patient).
*   This page uses a dedicated `FileUpload` component that allows selection of one or more files.
*   Selected files are displayed before uploading.
*   An upload button triggers the upload process, which communicates with a backend endpoint (assumed to be `/api/cases/:caseId/files`).
*   Upload progress (currently simulated based on the number of files for multi-file uploads; individual file progress via Axios is available in the service) and success/error messages are displayed to the user.
*   **Note**:
    *   The page currently uses a hardcoded case ID (`test-case-123`) for uploads. This will be made dynamic in future updates (e.g., when case selection is implemented).
    *   The actual backend endpoint for handling file uploads (e.g., using `multer` on an Express.js backend) needs to be implemented separately on the backend server for this feature to be fully functional end-to-end.
*   The file upload API communication logic is located in `services/fileService.js`.


### Doctor's Panel (Dashboard)

*   Doctors can access their dashboard via the `/dashboard/doctor` route (requires login as a Doctor).
*   This page displays a list of patient cases currently assigned to the logged-in doctor.
*   For each case, the dashboard shows:
    *   Case ID
    *   Patient ID
    *   Current Status (e.g., "Under Review", "Report Generated", with color coding)
    *   Creation Date
    *   Last Updated Date
*   A "Refresh Cases" button allows the doctor to manually re-fetch the list of assigned cases.
*   The list items are rendered using a reusable `CaseListItem.js` component.
*   Backend communication for fetching assigned cases is handled by `services/caseService.js`.
*   **Note**: Clicking on a case to view full details is a future enhancement.
