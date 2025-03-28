import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ResearchForm from './components/ResearchForm';
import ResearchResults from './components/ResearchResults';
import ReportsList from './components/ReportsList';
import ReportView from './components/ReportView';
import { API_URL } from './config';

export type ResearchData = {
  answer: string;
  learnings: string[];
  visitedUrls: string[];
};

function Navigation() {
  const location = useLocation();

  return (
    <nav className="mb-8">
      <ul className="flex justify-center space-x-6">
        <li>
          <Link
            to="/"
            className={`px-6 py-3 text-lg font-medium rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            Research
          </Link>
        </li>
        <li>
          <Link
            to="/reports"
            className={`px-6 py-3 text-lg font-medium rounded-lg transition-colors ${
              location.pathname === '/reports'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            Reports
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function ResearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async (formData: {
    query: string;
    depth: number;
    breadth: number;
    type: 'answer' | 'report';
    format?: 'standard' | 'threat';
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Research request failed');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (formData.type === 'report') {
        window.location.href = `/reports/${data.reportId}`;
        return;
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!results && (
        <ResearchForm onSubmit={handleResearch} isLoading={isLoading} />
      )}

      {results && (
        <ResearchResults 
          results={results}
          onReset={() => {
            setResults(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-100 mb-8">
            Deep Research
          </h1>
          
          <Navigation />

          <Routes>
            <Route path="/" element={<ResearchPage />} />
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/reports/:id" element={<ReportView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;