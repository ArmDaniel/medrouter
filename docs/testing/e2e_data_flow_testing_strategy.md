# End-to-End (E2E) Data Flow Testing Strategy

## 1. Objective

The primary objective of E2E data flow testing for MedRouter is to validate the complete pipeline from initial patient data input, through backend processing (including LLM interactions and data compilation), to the final generation and authorized access of medical reports and chat functionalities. This ensures all components integrate correctly and data integrity is maintained throughout the system.

## 2. Scope

This strategy covers the E2E testing of the following key data flows:

*   User registration and login for both Patients and Doctors.
*   Patient case creation (including text and file reference inputs).
*   Doctor selection by the patient for a case.
*   Data processing initiation by an assigned Doctor.
*   Interaction with LLM Adapters (MedGemma for text, Mistral for images) and compilation of their outputs.
*   Generation of Doctor-specific Markdown reports.
*   Generation of Patient-facing summaries/reports.
*   Secure access to reports by authorized Patients and Doctors.
*   Chat message creation and retrieval within a case by authorized users.
*   File upload by patients and association with a case (once backend file handling is complete).

## 3. Key Areas to Cover & Test Scenarios

### 3.1. User Authentication and Authorization
*   **Test Scenario**: Verify that only authenticated users can access protected routes and features.
*   **Test Scenario**: Verify role-based access control (RBAC) – Patients can only perform patient actions, Doctors can only perform doctor actions.

### 3.2. Case Creation and Initial Data Input
*   **Test Case 3.2.1 (Text Input Only)**:
    1.  Patient registers and logs in.
    2.  Patient creates a new case with only textual description of symptoms.
    3.  Patient selects an available Doctor for the case.
    4.  Verify case is created with "Pending Review" (or similar) status and correct patient/doctor association.
    5.  Verify initial text input is correctly stored in `caseData.patientProvidedInput.text`.
*   **Test Case 3.2.2 (Text and File Reference Input)**:
    1.  Patient registers and logs in.
    2.  Patient creates a new case with textual description and references to (mocked/uploaded) files (e.g., image filenames).
    3.  Patient selects a Doctor.
    4.  Verify case creation, associations, and that both text and file references are stored in `caseData.patientProvidedInput`.
    *(Note: Actual file upload E2E test depends on backend file handling implementation.)*

### 3.3. Data Processing by Doctor and LLM Interaction
*   **Test Case 3.3.1 (Successful LLM Processing)**:
    1.  Doctor logs in and accesses an assigned case (from TC 3.2.1 or 3.2.2).
    2.  Doctor triggers the "Process Case Data" action.
    3.  Verify the backend's `DataProcessingService` calls the appropriate LLM adapters:
        *   `medGemmaAdapter` for text.
        *   `mistralAdapter` for file references (images).
    4.  Using **mocked/stubbed successful responses** from the adapters for this test run:
        *   Verify that the (mocked) LLM outputs are correctly compiled and stored in `caseData.llmOutputs.medGemma` and `caseData.llmOutputs.mistral`.
        *   Verify the case status changes appropriately (e.g., "Processing Complete" or ready for report generation).
*   **Test Case 3.3.2 (LLM Adapter Error Handling)**:
    1.  Doctor triggers "Process Case Data".
    2.  Configure one of the LLM adapters (e.g., MedGemma) to return an **error response** (e.g., by temporarily modifying the adapter for the test or using a mock that simulates failure).
    3.  Verify that the error is handled gracefully:
        *   The `compiledData.llmOutputs.medGemma.error` field (or similar) is populated.
        *   The overall process doesn't crash.
        *   Other successful LLM outputs (if any) are still processed and stored.
        *   The UI (Doctor's panel) displays an appropriate notification about the partial success or failure.

### 3.4. Report Generation
*   **Test Case 3.4.1 (Doctor Markdown Report)**:
    1.  Following successful data processing (TC 3.3.1), Doctor triggers "Generate Doctor Report".
    2.  Verify `ReportGenerationService` uses the compiled `caseData.llmOutputs` to create a Markdown report.
    3.  Verify the generated Markdown content is stored in `caseData.finalReport`.
    4.  Verify case status changes to "Report Generated".
*   **Test Case 3.4.2 (Patient-Friendly Summary)**:
    1.  After Doctor report is generated, Doctor triggers "Generate Patient Summary".
    2.  Verify a simplified summary is generated (content validation based on mock inputs/outputs).
    *(Note: Storage and delivery mechanism for patient summary to be tested based on implementation.)*

### 3.5. Report Access
*   **Test Case 3.5.1 (Authorized Access)**:
    1.  Patient logs in and attempts to view their generated patient summary (if available) or final report (if permitted). Verify access is granted.
    2.  Assigned Doctor logs in and attempts to view the final Markdown report. Verify access is granted.
*   **Test Case 3.5.2 (Unauthorized Access)**:
    1.  A different Patient (not the owner of the case) attempts to access the case's report. Verify access is denied.
    2.  A different Doctor (not assigned to the case) attempts to access the case's report. Verify access is denied.

### 3.6. Chat Functionality
*   **Test Case 3.6.1 (Message Exchange)**:
    1.  Patient logs in, opens a case, and sends a chat message.
    2.  Verify message is stored and displayed correctly for the Patient.
    3.  Assigned Doctor logs in, opens the same case, and views the Patient's message.
    4.  Doctor sends a reply.
    5.  Verify Doctor's reply is stored and displayed for both Doctor and Patient.
*   **Test Case 3.6.2 (Unauthorized Chat Access)**:
    1.  Verify users not part of the case (other patients, other doctors) cannot view or send messages to that case's chat.

## 4. Testing Approach & Tools

*   **Manual Testing**:
    *   **Backend APIs**: Use tools like Postman or Insomnia to send requests to backend endpoints, simulating frontend actions. This helps isolate backend logic.
    *   **Frontend UI**: Manually interact with the frontend application in a browser, following the defined test scenarios.
*   **Mocking/Stubbing**:
    *   **LLM Adapters**: During E2E tests where live LLM calls are not desired (due to cost, rate limits, flakiness, or unavailability of local setup like LMStudio), the LLM adapters (`medGemmaAdapter.js`, `mistralAdapter.js`) should be temporarily modified or replaced with mocks/stubs that return predefined successful or error responses. This allows testing the data flow logic without actual LLM processing.
    *   **File System for Mistral**: The `mistralAdapter`'s dependency on local file access (currently `uploads_placeholder`) will require placing mock image files in that directory for tests involving image processing, or stubbing the `fs.existsSync` and `fs.createReadStream` calls within the adapter during tests.
*   **Automated E2E Testing (Future Consideration)**:
    *   Tools like Cypress or Playwright can be used to automate browser interactions for frontend E2E testing.
    *   API E2E tests can be automated using test runners like Jest (with Supertest for Node.js) or dedicated API testing frameworks.

## 5. Data Requirements for Testing

*   **Sample User Accounts**: Predefined Patient and Doctor accounts with known credentials.
*   **Sample Case Data**:
    *   Various textual inputs for patients (short, long, with specific keywords).
    *   References to mock image files (e.g., "image_normal.jpg", "image_anomaly.png").
*   **Mock LLM Adapter Responses**: Predefined JSON responses that the LLM adapters would return for given inputs. This includes both successful analysis data and simulated error responses. This ensures test predictability.
    *   Example MedGemma mock output (success): `{ summary: "Patient reports headache for 2 days.", entities: [...], raw_output_medgemma: "..." }`
    *   Example Mistral mock output (success): `{ imageId: "image_normal.jpg", description: "No anomalies detected.", ... }`

## 6. Test Environment

*   A dedicated testing environment (could be local using Docker Compose, or a deployed staging environment) where the full application stack (frontend, backend, database) is running.
*   Database should be reset or seeded with known data before test runs for consistency.

## 7. Reporting

*   Test execution status (Pass/Fail) for each test case.
*   Detailed bug reports for failed test cases, including steps to reproduce, expected vs. actual results, and relevant logs/screenshots.

This strategy document will be updated as the application evolves and new features are added.
