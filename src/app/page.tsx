'use client';

import React, { useState } from 'react';

// Helper function to format keys (e.g., foreignLanguage -> Foreign Language)
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
}

export default function Home() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault(); // Prevent form submission if used in a form
    if (!registrationNumber) return;

    setIsLoading(true);
    setError('');
    setStudentData(null);

    try {
      const response = await fetch(`/api/students/${registrationNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Student not found or error fetching data.');
      }
      setStudentData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Card */}
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">
            Check Student Scores
          </h3>
          <div className="card-text mb-3">
            <p>Enter a registration number to view the student's scores.</p>
          </div>
          <form className="row g-3 align-items-center" onSubmit={handleSearch}>
            <div className="col-auto">
              <label htmlFor="regNum" className="visually-hidden">
                Registration Number
              </label>
              <input
                type="text"
                className="form-control"
                name="regNum"
                id="regNum"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.trim())}
                placeholder="Enter registration number"
                required
              />
            </div>
            <div className="col-auto">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !registrationNumber}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <h4>Search Error</h4>
          <p>{error}</p>
        </div>
      )}

      {/* Student Data Display */}
      {studentData && (
        <div className="card mt-4">
          <div className="card-header">
            <h3 className="mb-0">
              Student Information
            </h3>
            <p className="card-subtitle text-muted">
              Registration Number: {studentData.registrationNumber}
            </p>
          </div>
          <div className="card-body">
            <dl className="row">
              {Object.entries(studentData)
                .filter(([key]) => !['id', 'registrationNumber', 'createdAt', 'updatedAt'].includes(key))
                .map(([key, value]) => (
                  <React.Fragment key={key}>
                    <dt className="col-sm-4">{formatKey(key)}</dt>
                    <dd className="col-sm-8">
                      {value !== null && value !== '' ? String(value) : <span className="text-muted">N/A</span>}
                    </dd>
                  </React.Fragment>
                ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
