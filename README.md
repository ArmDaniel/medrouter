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
