import React from 'react';
import { ResearchData } from '../App';

interface ResearchResultsProps {
  results: ResearchData;
  onReset: () => void;
}

function ResearchResults({ results, onReset }: ResearchResultsProps) {
  const handleDownload = () => {
    const content = `# Research Results

## Answer
${results.answer}

## Learnings
${results.learnings.map(learning => `- ${learning}`).join('\n')}

## Sources
${results.visitedUrls.map(url => `- ${url}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-results.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Research Results</h2>
        
        <div className="prose prose-invert max-w-none">
          <h3 className="text-xl font-semibold mb-2 text-gray-200">Answer</h3>
          <div className="bg-gray-900/50 p-4 rounded mb-6 text-gray-300">
            {results.answer}
          </div>

          <h3 className="text-xl font-semibold mb-2 text-gray-200">Key Learnings</h3>
          <ul className="list-disc pl-5 mb-6 text-gray-300">
            {results.learnings.map((learning, index) => (
              <li key={index} className="mb-2">{learning}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mb-2 text-gray-200">Sources</h3>
          <ul className="list-disc pl-5">
            {results.visitedUrls.map((url, index) => (
              <li key={index} className="mb-1">
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700"
        >
          Download Report
        </button>
        <button
          onClick={onReset}
          className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          New Research
        </button>
      </div>
    </div>
  );
}

export default ResearchResults