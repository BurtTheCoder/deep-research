import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Report } from '../../db';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../config';

function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleDownloadMarkdown = () => {
    if (!report?.content) return;
    
    // Generate a clean filename from the research query
    const cleanQuery = report.query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30); // Limit filename length
      
    const fileName = `research-${cleanQuery}-${report.id.slice(0, 8)}.md`;
    
    // Create a Blob with the content
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const checkReport = () => {
      fetch(`${API_URL}/api/reports/${id}`)
        .then(res => res.json())
        .then(data => {
          setReport(data);
          setIsLoading(false);
          
          // If still processing, check again in 5 seconds
          if (data.status === 'processing') {
            setTimeout(checkReport, 5000);
          }
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    };

    checkReport();
  }, [id]);

  if (isLoading) {
    return <div className="text-center">Loading report...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/reports" className="text-indigo-400 hover:text-indigo-300">
          ← Back to Reports
        </Link>
        
        <div className="flex items-center gap-3">
          {report.status === 'completed' && report.content && (
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1 bg-emerald-700 text-white rounded-md hover:bg-emerald-600 flex items-center"
              aria-label="Download as Markdown"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"></path>
              </svg>
              Download
            </button>
          )}
          
          <span className={`px-3 py-1 text-sm rounded-full ${
            report.status === 'completed' ? 'bg-green-900 text-green-200' :
            report.status === 'processing' ? 'bg-yellow-900 text-yellow-200' :
            'bg-red-900 text-red-200'
          }`}>
            {report.status}
          </span>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-4">{report.query}</h1>
        
        {report.status === 'processing' && (
          <div className="animate-pulse text-yellow-200">
            Generating report...
          </div>
        )}

        {report.status === 'failed' && (
          <div className="text-red-400">
            Error: {report.error}
          </div>
        )}

        {report.status === 'completed' && report.content && (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportView;
