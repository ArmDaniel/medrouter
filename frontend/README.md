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
