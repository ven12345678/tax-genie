'use client';

import React, { useState } from 'react';

export default function IncomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/analyze-income', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysisData(data.summary);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the income chart using div elements
  const renderIncomeChart = () => {
    if (!analysisData?.sourceBreakdown) return null;

    const sources = Object.entries(analysisData.sourceBreakdown);
    const maxAmount = Math.max(...sources.map(([_, amount]) => amount));

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Income Sources</h3>
        <div className="space-y-4">
          {sources.map(([source, amount]) => (
            <div key={source} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{source}</span>
                <span className="text-sm font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{
                    width: `${(amount / maxAmount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Income Tracking</h1>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Income Data</h2>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="bg-blue-50 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">File Requirements:</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside">
                <li>CSV file format</li>
                <li>Required columns: Date, Source, Amount, Description</li>
                <li>Date format: YYYY-MM-DD</li>
                <li>Amount should be numeric</li>
              </ul>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isLoading}
                className={`px-4 py-2 rounded-md text-white font-medium
                  ${!selectedFile || isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? 'Processing...' : 'Upload & Analyze'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Income Analysis</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-700">Total Income</h3>
              <p className="text-2xl font-bold text-green-900">
                ${analysisData.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700">Income Sources</h3>
              <p className="text-2xl font-bold text-blue-900">
                {Object.keys(analysisData.sourceBreakdown).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-700">Time Period</h3>
              <p className="text-2xl font-bold text-purple-900">
                {Object.keys(analysisData.monthlyTrend).length} months
              </p>
            </div>
          </div>

          {/* Income Chart */}
          {renderIncomeChart()}

          {/* Monthly Trend */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Monthly Trend</h3>
            <div className="space-y-4">
              {Object.entries(analysisData.monthlyTrend)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{month}</span>
                    <span className="text-green-600 font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Income Entry Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              id="amount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              id="source"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter income source"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Income
          </button>
        </form>
      </div>
    </div>
  );
} 