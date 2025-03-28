import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../../db';
import { API_URL } from '../config';

function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/reports`)
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="text-center">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Research Reports</h2>
      
      {reports.length === 0 ? (
        <p className="text-gray-400">No reports yet.</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {reports.map(report => (
              <li key={report.id} className="p-4 hover:bg-gray-700">
                <Link to={`/reports/${report.id}`} className="block">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-gray-200">{report.query}</p>
                      <p className="text-sm text-gray-400">
                        Created: {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'completed' ? 'bg-green-900 text-green-200' :
                        report.status === 'processing' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReportsList;