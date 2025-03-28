import React, { useState } from 'react';

interface ResearchFormProps {
  onSubmit: (data: { 
    query: string; 
    depth: number; 
    breadth: number; 
    type: 'answer' | 'report';
    format?: 'standard' | 'threat';
  }) => void;
  isLoading: boolean;
}

function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState(2);
  const [breadth, setBreadth] = useState(4);
  const [type, setType] = useState<'answer' | 'report'>('answer');
  const [format, setFormat] = useState<'standard' | 'threat'>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      query, 
      depth, 
      breadth, 
      type,
      format: type === 'report' ? format : undefined 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-300">
          Research Query
        </label>
        <textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={4}
          required
          placeholder="What would you like to research?"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="depth" className="block text-sm font-medium text-gray-300">
            Research Depth (1-5)
          </label>
          <input
            type="number"
            id="depth"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            min={1}
            max={5}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-400">
            How deep should the research go? (Default: 2)
          </p>
        </div>

        <div>
          <label htmlFor="breadth" className="block text-sm font-medium text-gray-300">
            Research Breadth (2-10)
          </label>
          <input
            type="number"
            id="breadth"
            value={breadth}
            onChange={(e) => setBreadth(Number(e.target.value))}
            min={2}
            max={10}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-400">
            How many parallel searches? (Default: 4)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Research Type
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="answer"
                checked={type === 'answer'}
                onChange={(e) => setType(e.target.value as 'answer')}
                className="form-radio text-indigo-600 bg-gray-700 border-gray-600"
              />
              <span className="ml-2 text-gray-300">Quick Answer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="report"
                checked={type === 'report'}
                onChange={(e) => setType(e.target.value as 'report')}
                className="form-radio text-indigo-600 bg-gray-700 border-gray-600"
              />
              <span className="ml-2 text-gray-300">Detailed Report</span>
            </label>
          </div>
        </div>

        {type === 'report' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Format
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="standard"
                  checked={format === 'standard'}
                  onChange={(e) => setFormat(e.target.value as 'standard')}
                  className="form-radio text-indigo-600 bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-gray-300">Standard</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="threat"
                  checked={format === 'threat'}
                  onChange={(e) => setFormat(e.target.value as 'threat')}
                  className="form-radio text-indigo-600 bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-gray-300">Threat Research</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? 'bg-indigo-600/50 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Researching...' : 'Start Research'}
        </button>
      </div>
    </form>
  );
}

export default ResearchForm;