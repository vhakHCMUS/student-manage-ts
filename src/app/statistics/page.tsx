'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Consistent subject names and labels
const subjectsMap: { [key: string]: string } = {
  math: 'Math',
  literature: 'Literature',
  foreignLanguage: 'Foreign Language',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  history: 'History',
  geography: 'Geography',
  civicEducation: 'Civic Education',
};
const subjectKeys = Object.keys(subjectsMap);

const scoreRanges = [
  { min: 8, max: 10.1, label: '>= 8 points' }, // max adjusted slightly for inclusivity
  { min: 6, max: 8, label: '6-8 points' },
  { min: 4, max: 6, label: '4-6 points' },
  { min: 0, max: 4, label: '< 4 points' },
];

interface StatisticsData {
  subjects: string[];
  distribution: Record<string, Record<string, number>>;
}

interface Student {
  id: string;
  registrationNumber: string;
  math: number | null;
  physics: number | null;
  chemistry: number | null;
  // Add other subjects if needed for display, though not strictly required for top 10 A group
}

// Helper function to format subject keys
function formatSubjectKey(key: string): string {
  return subjectsMap[key] || key; // Use mapped name or fallback to key
}

// Define colors for the chart bars
const subjectColors = [
  'rgba(255, 99, 132, 0.6)', // Red
  'rgba(54, 162, 235, 0.6)', // Blue
  'rgba(255, 206, 86, 0.6)', // Yellow
  'rgba(75, 192, 192, 0.6)', // Teal
  'rgba(153, 102, 255, 0.6)', // Purple
  'rgba(255, 159, 64, 0.6)',  // Orange
  'rgba(99, 255, 132, 0.6)',  // Green
  'rgba(235, 54, 162, 0.6)',  // Pink
  'rgba(86, 255, 206, 0.6)',  // Mint
  'rgba(102, 153, 255, 0.6)', // Light Blue
  // Add more colors if more subjects are expected
];

export default function Statistics() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, topStudentsResponse] = await Promise.all([
          fetch('/api/statistics'),
          fetch('/api/students/top'),
        ]);

        if (!statsResponse.ok || !topStudentsResponse.ok) {
          throw new Error('Failed to fetch statistics or top students data.');
        }

        const statsData = await statsResponse.json();
        const topStudentsData = await topStudentsResponse.json();

        setStatistics(statsData);
        setTopStudents(topStudentsData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Score Range',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Score Distribution by Subject',
        font: { size: 16 }, // Adjust title font size
      },
      tooltip: {
        mode: 'index' as const, 
        intersect: false,
      },
    },
  };

  const chartData = {
    labels: scoreRanges.map(range => range.label),
    datasets: statistics?.subjects.map((subjectKey: string, index: number) => ({
      label: formatSubjectKey(subjectKey),
      data: scoreRanges.map(range =>
        statistics?.distribution[subjectKey]?.[range.label] || 0
      ),
      // Assign a unique color to each subject dataset
      backgroundColor: subjectColors[index % subjectColors.length], 
    })) || [],
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3">Loading Statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
         <h4 className="alert-heading">Error Loading Data</h4>
         <p>{error}</p>
       </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Score Distribution Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title mb-0">
            Score Distribution
          </h2>
        </div>
        <div className="card-body">
          {statistics ? (
            <div style={{ height: '600px' }}>
              <Bar options={chartOptions} data={chartData} />
            </div>
          ) : (
            <p className="text-muted">No statistics data available.</p>
          )}
        </div>
      </div>

      {/* Top Students Card */}
      <div className="card mt-4">
        <div className="card-header">
           <h2 className="card-title mb-0">
             Top 10 Students (Group A: Math, Physics, Chemistry)
           </h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Reg. Number</th>
                  <th scope="col">Math</th>
                  <th scope="col">Physics</th>
                  <th scope="col">Chemistry</th>
                  <th scope="col">Average</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.length > 0 ? (
                  topStudents.map((student, index) => {
                    const avg = (student.math ?? 0) + (student.physics ?? 0) + (student.chemistry ?? 0);
                    const avgScore = (avg / 3).toFixed(2);
                    return (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.registrationNumber}</td>
                        <td>{student.math ?? 'N/A'}</td>
                        <td>{student.physics ?? 'N/A'}</td>
                        <td>{student.chemistry ?? 'N/A'}</td>
                        <td>{avgScore}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No top student data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 