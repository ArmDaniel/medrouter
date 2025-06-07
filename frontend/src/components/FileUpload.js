import React, { useState, useCallback } from 'react';
import styles from './FileUpload.module.css'; // We'll create this CSS module

const FileUpload = ({ onUploadSuccess, onUploadError, caseId, uploadFunction }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Basic progress state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFileChange = (event) => {
    setError(null);
    setSuccessMessage(null);
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    if (!uploadFunction) {
        setError("Upload function not provided.");
        console.error("FileUpload: uploadFunction prop is missing.");
        return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0); // Reset progress

    try {
      // In a real scenario, uploadFunction would handle multiple files if needed,
      // or this component would loop and call it for each.
      // For simplicity, let's assume uploadFunction can handle an array of files or one by one.
      // This example will focus on uploading one file at a time if multiple are selected,
      // or one call if uploadFunction supports multiple.

      // Let's simulate progress for multiple files by iterating
      // This is a simplified progress simulation. Real progress needs XHR events.
      const uploadedFileResponses = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // Simulate progress for each file, or overall progress if one FormData for all
        // For simplicity, let's assume uploadFunction takes one file and returns its response.
        // A more advanced uploadFunction would take an onProgress callback.
        const response = await uploadFunction(caseId, file);
        uploadedFileResponses.push(response);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setSuccessMessage(`Successfully uploaded ${uploadedFileResponses.length} file(s)!`);
      if (onUploadSuccess) {
        onUploadSuccess(uploadedFileResponses); // Pass array of responses
      }
      setSelectedFiles([]); // Clear selection after successful upload

    } catch (err) {
      console.error("Upload failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Upload failed. Please try again.";
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      // Keep progress at 100 or reset after a delay
      // setTimeout(() => setUploadProgress(0), 2000); // Optional: reset progress bar
    }
  };

  return (
    <div className={styles.fileUploadContainer}>
      <h3>Upload Files</h3>
      <input
        type="file"
        multiple // Allow multiple file selection
        onChange={handleFileChange}
        className={styles.fileInput}
        disabled={isUploading}
      />
      {selectedFiles.length > 0 && (
        <div className={styles.selectedFiles}>
          <h4>Selected Files:</h4>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>
                {file.name} ({ (file.size / 1024).toFixed(2) } KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || selectedFiles.length === 0}
        className={styles.uploadButton}
      >
        {isUploading ? `Uploading (${Math.round(uploadProgress)}%)...` : 'Upload Selected Files'}
      </button>

      {isUploading && uploadProgress > 0 && (
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${uploadProgress}%` }}
          >
            {Math.round(uploadProgress)}%
          </div>
        </div>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
    </div>
  );
};

export default FileUpload;
