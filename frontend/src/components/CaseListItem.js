import React from 'react';
import { Link } from 'react-router-dom'; // For linking to case details later
import styles from './CaseListItem.module.css'; // Create this CSS module

const CaseListItem = ({ caseItem }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return 'Invalid Date'; }
  };

  // Helper to get a readable and CSS-friendly status class
  const getStatusClass = (status) => {
    if (!status) return 'statusUnknown';
    return `status${status.replace(/\s+/g, '')}`;
  };

  return (
    <li className={styles.caseListItem}>
      <div className={styles.caseInfo}>
        <strong>Case ID:</strong> {caseItem.caseid}
      </div>
      <div className={styles.caseInfo}>
        <strong>Patient ID:</strong> {caseItem.patientid}
      </div>
      <div className={styles.caseInfo}>
        <strong>Status:</strong>
        <span className={`${styles.status} ${styles[getStatusClass(caseItem.status)]}`}>
          {caseItem.status || 'N/A'}
        </span>
      </div>
      <div className={styles.caseInfo}>
        <strong>Created:</strong> {formatDate(caseItem.createdat)}
      </div>
      <div className={styles.caseInfo}>
        <strong>Last Updated:</strong> {formatDate(caseItem.updatedat)}
      </div>
      <div className={styles.caseActions}>
        <Link to={`/chat/${caseItem.caseid}`} className={styles.viewDetailsLink}>
          Open Chat
        </Link>
      </div>
    </li>
  );
};

export default CaseListItem;
