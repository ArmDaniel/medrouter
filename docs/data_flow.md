# Data Flow Diagram

This document describes the flow of data within the MedRouter application, from initial user input to the generation of final reports.

## Overview

MedRouter processes patient data using two Language Models (LLMs) – MedGemma for general medical text analysis and a fine-tuned Mistral model for medical image analysis. The outputs are then compiled, and reports are generated for both patients and doctors.

## Steps in Data Flow

1.  **Patient Input & Case Creation**:
    *   A **Patient** initiates a new case through the chat interface.
    *   Input can be:
        *   Textual description of symptoms or medical history.
        *   Uploaded files (e.g., medical images like X-rays, CT scans, or documents like PDFs of previous lab reports).
    *   A new **Patient Case** record is created in the database with a "Pending" status. The initial data is stored and associated with this case.

2.  **Doctor Selection by Patient**:
    *   After case creation, the **Patient** is presented with a list of available **Doctors**. This list can be filtered by medical specialty relevant to the case data provided.
    *   The system may also display additional information such as doctor reviews or scores (the mechanism for reviews/scores is a future consideration).
    *   The **Patient** selects a **Doctor** from this list to assign to their case.
    *   Upon doctor selection, the chosen **Doctor** is notified, and the case status might change to 'Pending Doctor Acceptance' or directly to 'Under Review' if explicit acceptance is not required from the doctor's side initially.

3.  **Data Processing by LLMs**:
    *   The **Backend API Gateway** routes the patient's data to the appropriate LLMs:
        *   Textual data is sent to **MedGemma** (running locally via LMStudio) for analysis, summarization, and identification of key medical entities.
        *   Medical images are sent to the fine-tuned **Mistral model API** for specialized image analysis (e.g., identifying anomalies, patterns).
        *   PDFs or other documents might undergo text extraction first, then the extracted text is sent to MedGemma.
    *   Each LLM processes the input and returns its analysis results (e.g., structured JSON, text).

4.  **Data Compilation**:
    *   The **Data Processing Module** in the backend collects the outputs from both MedGemma and the Mistral model.
    *   This module compiles these diverse pieces of information into a single, coherent **data pool** associated with the patient case. This pool might contain:
        *   Original patient input.
        *   MedGemma's text analysis (summaries, entities, potential conditions).
        *   Mistral's image analysis (description of findings, highlighted areas).
        *   Extracted text from documents.

5.  **Report Generation**:
    *   Based on the compiled data pool, the **Report Generation Module** (utilizing a Factory Pattern) creates two types of reports:
        *   **Doctor's Report**: A comprehensive Markdown document containing:
            *   All original data.
            *   Detailed outputs from both LLMs.
            *   Compiled findings.
            *   Sections for the doctor to add their own notes, diagnosis, and treatment plan.
        *   **Patient's Report**: A simplified, formatted response (e.g., easy-to-understand HTML or plain text within the chat interface) summarizing:
            *   Key findings in non-technical language.
            *   Next steps or recommendations (as per doctor's input or template).
            *   This report is generated after the doctor reviews and finalizes their own report.

6.  **Doctor Review and Finalization**:
    *   The **Doctor** reviews the compiled data and the preliminary Doctor's Report.
    *   The Doctor adds their diagnosis, notes, and recommendations.
    *   The Doctor finalizes their report, which updates the **Patient Case** (e.g., `finalReport` field for doctor's version, and triggers generation of patient-facing summary).
    *   The case status might change to "Report Generated".

7.  **Patient Access to Report**:
    *   The **Patient** receives a notification that their report is ready.
    *   They can view the simplified patient-facing report/summary via the chat interface.

8.  **Chat Communication**:
    *   Throughout the process (especially during review and after report generation), the **Patient** and **Doctor** can communicate via the secure **Chat Interface**.
    *   All messages are stored as **Chat Message** records, linked to the specific **Patient Case**.

## Data Storage:

*   **User Data**: Stored in a secure database (e.g., PostgreSQL, MongoDB).
*   **Patient Case Data**: Includes all inputs, LLM outputs (or references to them), generated reports, status, and associations with patient/doctor.
*   **Chat History**: Stored per case.

## Security Considerations:

*   All data in transit is encrypted (TLS/SSL).
*   Sensitive data at rest is encrypted.
*   Authentication and authorization mechanisms control access to data at each step.
```
