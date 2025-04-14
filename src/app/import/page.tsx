'use client';

import { useState, useEffect, useCallback } from 'react';

const BATCH_SIZE = 10000;

export default function ImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);

  const fetchStudentCount = useCallback(async () => {
    setCountLoading(true);
    try {
      const response = await fetch('/api/students/count');
      if (!response.ok) throw new Error('Failed to fetch student count');
      const data = await response.json();
      setStudentCount(data.count);
    } catch (err: any) {
      setError(err.message || 'Could not load student count.');
      setStudentCount(null);
    } finally {
      setCountLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentCount();
  }, [fetchStudentCount]);

  const startImport = async () => {
    setIsImporting(true);
    setProgress(0);
    setMessage('Starting import...');
    setError('');

    let batchIndex = 0;
    let completed = false;
    let totalRecords = 0;

    while (!completed) {
      try {
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batchIndex, batchSize: BATCH_SIZE }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Import failed for batch ' + (batchIndex + 1));
        }

        if (batchIndex === 0 && data.totalRecords) {
          totalRecords = data.totalRecords;
        }
        
        setMessage(data.message || `Processed batch ${batchIndex + 1}...`);
        setProgress(data.progress || 0);
        completed = data.completed || false;

        if (completed && data.message !== 'No more records to import.') {
           setMessage(`Import completed successfully! Processed approximately ${data.importedCount || 'all'} records.`);
        } else if (completed) {
           setMessage('No data found to import or import already completed.');
           setProgress(100);
        } else {
          batchIndex++;
        }
      } catch (err: any) {
        console.error("Import error:", err);
        setError(err.message || 'An error occurred during import');
        completed = true;
      }
    }

    setIsImporting(false);
    fetchStudentCount();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL student records? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setMessage('Deleting student records...');
    setError('');
    setProgress(0);

    try {
      const response = await fetch('/api/students/delete-all', {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete students.');
      }

      setMessage(`Successfully deleted ${data.deletedCount} student records.`);
      fetchStudentCount();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || 'An error occurred during deletion.');
      setMessage('');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Import Student Data</h2>

          <div className="mb-3">
            {countLoading ? (
              <p className="text-muted">Loading student count...</p>
            ) : studentCount !== null ? (
              <p>Currently, there are <strong>{studentCount}</strong> students in the database.</p>
            ) : (
              <p className="text-danger">Could not load student count.</p>
            )}
          </div>

          <div className="mb-3">
            <p className="card-text">
              Click the button below to import student score data from the <code className="user-select-all">diem_thi_thpt_2024.csv</code> file located in the project root.
              This process runs in batches and might take some time.
            </p>
           </div>

          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              onClick={startImport}
              disabled={isImporting || isDeleting}
              className="btn btn-primary"
            >
              {isImporting ? (
                 <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Importing...</> 
              ) : (
                 'Start Import'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={isImporting || isDeleting}
              className="btn btn-danger"
            >
              {isDeleting ? (
                 <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...</> 
              ) : (
                 'Delete All Students'
              )}
            </button>
          </div>

          {(isImporting || progress > 0 && !isDeleting) && (
            <div className="mb-3">
              <h5>Import Progress</h5>
              <div className="progress">
                 <div
                   className="progress-bar progress-bar-striped progress-bar-animated"
                   role="progressbar"
                   style={{ width: `${progress}%` }}
                   aria-valuenow={progress}
                   aria-valuemin={0}
                   aria-valuemax={100}
                 >{progress}%</div>
               </div>
            </div>
          )}

          {message && (
            <div className={`alert ${error ? 'alert-danger' : (progress === 100 && !isImporting && !isDeleting ? 'alert-success' : 'alert-info')}`} role="alert">
              {message}
            </div>
          )}
          {error && !message && (
             <div className="alert alert-danger" role="alert">
                {error}
             </div>
          )}
        </div>
      </div>
    </div>
  );
} 