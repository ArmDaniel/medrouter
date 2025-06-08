import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import caseService from '../services/caseService';
import CaseListItem from '../components/CaseListItem'; // Import the new component
import styles from './DoctorDashboardPage.module.css';
// Link is not used directly here anymore if CaseListItem handles its own link
// import { Link } from 'react-router-dom';

const DoctorDashboardPage = () => {
  const [assignedCases, setAssignedCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, tokens } = useAuthStore();

  const fetchAssignedCases = useCallback(async () => {
    if (!user || user.role !== 'Doctor' || !tokens?.accessToken) {
      setError("User is not authorized or not logged in as a Doctor.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const cases = await caseService.getAssignedCases();
      setAssignedCases(cases);
    } catch (err) {
      console.error("Failed to load assigned cases:", err);
      setError(err.message || 'Failed to load assigned cases.');
    } finally {
      setIsLoading(false);
    }
  }, [user, tokens?.accessToken]);

  useEffect(() => {
    fetchAssignedCases();
  }, [fetchAssignedCases]);

  // formatDate is now part of CaseListItem, but can be kept if needed elsewhere or passed
  // const formatDate = (dateString) => { ... };

  if (!user || user.role !== 'Doctor') {
    return (
      <div className={styles.dashboardContainer}>
        <p>You are not authorized to view this page. Please log in as a Doctor.</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h2>Doctor Dashboard</h2>
        <p>Welcome, Dr. {user.name}!</p>
      </header>

      <button onClick={fetchAssignedCases} disabled={isLoading} className={styles.refreshButton}>
        {isLoading ? 'Refreshing...' : 'Refresh Cases'}
      </button>

      {error && <p className={styles.errorMessage}>Error: {error}</p>}

      {isLoading && assignedCases.length === 0 && <p>Loading assigned cases...</p>}

      {!isLoading && assignedCases.length === 0 && !error && (
        <p className={styles.noCasesMessage}>No cases are currently assigned to you.</p>
      )}

      {assignedCases.length > 0 && (
        <div className={styles.caseList}>
          <h3>Your Assigned Cases</h3>
          <ul className={styles.ul}> {/* Ensure this ul style is appropriate or remove if CaseListItem handles all list styling */}
            {assignedCases.map((caseItem) => (
              <CaseListItem key={caseItem.caseid} caseItem={caseItem} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardPage;
