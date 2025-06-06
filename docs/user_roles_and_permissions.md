# User Roles and Permissions

This document outlines the user roles and their respective permissions within the MedRouter application.

## Roles

There are two primary roles in MedRouter:

1.  **Patient**: Individuals seeking medical analysis and reports.
2.  **Doctor**: Medical professionals providing analysis and managing patient cases.

## Permissions

### Patient Permissions

Patients have the following capabilities:

*   **Account Management**:
    *   Create and manage their own account.
    *   Update their profile information (excluding role).
    *   Delete their account (subject to data retention policies).
*   **Case Management**:
    *   Create new medical cases by providing initial data (text, uploading files like images, PDFs) and selecting a doctor based on specialty.
    *   View a list of available doctors, potentially filtered by specialty and displaying information like reviews or scores (details of review/score system to be defined later).
    *   Select a doctor for their case from the available list.
    *   View the status of their active cases.
    *   Access and view simplified reports generated for them.
    *   Communicate with the assigned doctor via the chat interface for their specific case.
*   **Data Access**:
    *   Access their own user data.
    *   Access their own chat history for each case.
    *   Access their final patient-facing reports.

### Doctor Permissions

Doctors have the following capabilities:

*   **Account Management**:
    *   Create and manage their own account (details may be pre-verified by an admin in a full system).
    *   Update their profile information, including specialty (excluding role).
*   **Case Management**:
    *   View all data associated with patient cases assigned to them by patients (including raw data provided by the patient and outputs from LLMs).
    *   Generate comprehensive medical reports in Markdown format.
    *   Communicate with patients via the chat interface for cases assigned to them.
    *   Update the status of patient cases (e.g., "Pending", "Under Review", "Report Generated", "Closed").
*   **Data Access**:
    *   Access their own user data.
    *   Access all data related to patient cases they are assigned to.
    *   Access chat histories for cases they are assigned to.
*   **Notifications**:
    *   Receive notifications when a patient selects them for a new case.
    *   Receive notifications for new messages from patients on their assigned cases.

## Future Considerations

*   **Admin Role**: A potential future role could be an Administrator, responsible for overall system management, user management (including doctor verification), and overseeing compliance.
*   **Granular Permissions**: Depending on system evolution, permissions might become more granular (e.g., differentiating types of data a doctor can access based on specialty before case assignment).
```
