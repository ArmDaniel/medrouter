import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import fileService from '../services/fileService'; // Import the service
import useAuthStore from '../store/authStore';
import styles from './PatientFileUploadPage.module.css'; // Create this CSS module

const PatientFileUploadPage = () => {
  // TODO: Replace with dynamic case ID selection later
  const HARDCODED_CASE_ID = 'test-case-123'; // Example case ID for which to upload files

  const [uploadResults, setUploadResults] = useState([]);
  const [pageError, setPageError] = useState(null);
  const { user } = useAuthStore();

  const handleUploadSuccess = (responses) => {
    console.log('Upload successful on page:', responses);
    // responses is an array of objects like {fileName, status, data} from fileService.uploadFiles
    // or a single response object if FileUpload calls uploadFile directly for single file.
    // For now, let's assume FileUpload might call uploadFunction per file,
    // so responses is an array of backend responses.
    setUploadResults(prevResults => [...prevResults, ...responses.filter(r => r.data)]); // Store successful uploads' data
    setPageError(null); // Clear any previous page error
    // Potentially, update case data on backend or trigger other actions
  };

  const handleUploadError = (errorMessage) => {
    console.error('Upload error on page:', errorMessage);
    setPageError(`Failed to upload one or more files: ${errorMessage}`);
  };

  // This function will be passed to FileUpload component
  // FileUpload component will call this for each file if it handles them one-by-one,
  // or once if it prepares a batch. The current FileUpload calls it per selected file.
  const actualUploadFunction = async (caseId, file) => {
    // Here, we can use the onUploadProgress callback from fileService.uploadFile if needed
    // For simplicity in FileUpload, it simulates its own progress based on file count.
    // If FileUpload needs true per-file progress, it would need to take onUploadProgress prop too.
    return fileService.uploadFile(caseId, file, (percent) => {
        console.log(`File ${file.name} upload progress: ${percent}%`);
        // This progress could be bubbled up to FileUpload or managed here if needed
    });
  };


  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <p>Please log in to upload files.</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h2>Upload Files for Case: {HARDCODED_CASE_ID}</h2>
      </header>

      <FileUpload
        caseId={HARDCODED_CASE_ID}
        uploadFunction={actualUploadFunction} // Pass the actual service call
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {pageError && <p className={styles.pageErrorMessage}>{pageError}</p>}

      {uploadResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3>Successfully Uploaded Files:</h3>
          <ul>
            {uploadResults.map((result, index) => (
              <li key={index}>
                File: {result.fileId || result.fileName || 'Unknown File'} - Path/ID: {result.filePath || result.fileId || 'N/A'}
                {/* Adjust based on what your backend returns in 'result.data' */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientFileUploadPage;
