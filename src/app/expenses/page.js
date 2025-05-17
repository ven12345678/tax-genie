'use client';

import React, { useState } from 'react';

export default function ExpensesPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.name.split('.').pop().toLowerCase();
      
      // Accept all file types but warn about non-CSV files
      setSelectedFile(file);
      if (fileType !== 'csv') {
        setError('Note: Only CSV files can be analyzed at the moment. Other file types will be supported in future updates.');
      } else {
        setError(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    // Only process CSV files for now
    if (!selectedFile.name.match(/\.(csv)$/)) {
      setError('Currently, only CSV files can be processed for analysis. Support for other file types coming soon!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/analyze-expense', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process file');
      }

      setAnalysisData(data.summary);
      setError(null);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the file');
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the expense chart using div elements
  const renderExpenseChart = () => {
    if (!analysisData?.categoryBreakdown) return null;

    const categories = Object.entries(analysisData.categoryBreakdown);
    const maxAmount = Math.max(...categories.map(([_, amount]) => amount));

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Expense Breakdown</h3>
        <div className="space-y-4">
          {categories.map(([category, amount]) => (
            <div key={category} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{category}</span>
                <span className="text-sm font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
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
      <h1 className="text-3xl font-bold mb-6">Expenses Tracking</h1>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Expense Data</h2>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="bg-blue-50 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">File Requirements:</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside">
                <li>Supported file types:
                  <ul className="ml-6 list-disc">
                    <li>CSV files (fully supported)</li>
                    <li>PDF files (coming soon)</li>
                    <li>Images - PNG, JPG (coming soon)</li>
                  </ul>
                </li>
                <li className="mt-2">For CSV files:</li>
                <ul className="ml-6 list-disc">
                  <li>Required columns: Date, Category, Amount</li>
                  <li>Optional columns: Description</li>
                  <li>Date format: YYYY-MM-DD</li>
                  <li>Amount should be numeric</li>
                </ul>
              </ul>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv,.pdf,.png,.jpg,.jpeg"
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
          
          {error && (
            <div className={`border rounded-md p-4 ${
              selectedFile && !selectedFile.name.match(/\.(csv)$/)
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`font-medium mb-1 ${
                selectedFile && !selectedFile.name.match(/\.(csv)$/)
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {selectedFile && !selectedFile.name.match(/\.(csv)$/)
                  ? 'Note'
                  : 'Error'}
              </p>
              <p className={`text-sm ${
                selectedFile && !selectedFile.name.match(/\.(csv)$/)
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }`}>
                {error}
              </p>
            </div>
          )}
          
          {selectedFile && !error && (
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Expense Analysis</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700">Total Expenses</h3>
              <p className="text-2xl font-bold text-blue-900">
                ${analysisData.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-700">Categories</h3>
              <p className="text-2xl font-bold text-green-900">
                {Object.keys(analysisData.categoryBreakdown).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-700">Time Period</h3>
              <p className="text-2xl font-bold text-purple-900">
                {Object.keys(analysisData.monthlyTrend).length} months
              </p>
            </div>
          </div>

          {/* Expense Chart */}
          {renderExpenseChart()}

          {/* Monthly Trend */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Monthly Trend</h3>
            <div className="space-y-4">
              {Object.entries(analysisData.monthlyTrend)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{month}</span>
                    <span className="text-blue-600 font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 