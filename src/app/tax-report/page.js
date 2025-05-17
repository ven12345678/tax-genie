'use client';
//a
import React, { useState, useEffect } from 'react';

export default function TaxReportPage() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingMongoDB, setIsAnalyzingMongoDB] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [taxHistory, setTaxHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchTaxHistory();
  }, []);

  const fetchTaxHistory = async () => {
    try {
      const response = await fetch('/api/tax-history');
      const data = await response.json();
      
      if (data.success) {
        setTaxHistory(data.data);
      } else {
        console.error('Failed to fetch tax history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tax history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file');
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-tax', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process the file');
      }

      setAnalysisResult(data);
      // Refresh tax history after new analysis
      fetchTaxHistory();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while processing the file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMongoDB = async () => {
    setIsAnalyzingMongoDB(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-mongodb', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze data from MongoDB');
      }

      setAnalysisResult(data);
      // Refresh tax history after new analysis
      fetchTaxHistory();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while analyzing data');
    } finally {
      setIsAnalyzingMongoDB(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tax Report</h1>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Tax Data</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className={`px-4 py-2 rounded-md text-white font-medium
                ${!file || isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? 'Processing...' : 'Analyze CSV'}
            </button>
            <button
              onClick={handleAnalyzeMongoDB}
              disabled={isAnalyzingMongoDB}
              className={`px-4 py-2 rounded-md text-white font-medium
                ${isAnalyzingMongoDB
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isAnalyzingMongoDB ? 'Analyzing...' : 'Analyze from Database'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm font-medium">Error</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
          )}
          
          {file && (
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-600">
                Selected file: {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Make sure your CSV file has the following headers: type, amount, description, date
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tax Analysis Results</h2>
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Total Income</h3>
                <p className="text-2xl font-bold text-green-600">
                  RM {analysisResult.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Total Deductions</h3>
                <p className="text-2xl font-bold text-red-600">
                  RM {analysisResult.totalDeductions.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Taxable Income</h3>
                <p className="text-2xl font-bold text-blue-600">
                  RM {analysisResult.taxableIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Estimated Tax</h3>
                <p className="text-2xl font-bold text-purple-600">
                  RM {analysisResult.estimatedTax.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Declarable Expenses */}
            <div>
              <h3 className="text-lg font-medium mb-3">Declarable Expenses</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2">
                  {Array.isArray(analysisResult.declarableExpenses) && analysisResult.declarableExpenses.map((expense, index) => (
                    <li key={index} className="text-gray-700">
                      {typeof expense === 'object' ? (
                        <span>
                          <span className="font-semibold">{expense.Category}</span>: RM {expense.Amount} <span className="italic">{expense.Note}</span>
                        </span>
                      ) : (
                        expense
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tax Relief Expenses */}
            <div>
              <h3 className="text-lg font-medium mb-3">Tax Relief Expenses</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2">
                  {Array.isArray(analysisResult.taxReliefExpenses) && analysisResult.taxReliefExpenses.map((expense, index) => (
                    <li key={index} className="text-gray-700">
                      {typeof expense === 'object' ? (
                        <span>
                          <span className="font-semibold">{expense.Category}</span>: RM {expense.Amount} <span className="italic">{expense.Note}</span>
                        </span>
                      ) : (
                        expense
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div>
              <h3 className="text-lg font-medium mb-3">Detailed Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {analysisResult.analysis}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Report History Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Tax Report History</h2>
        {isLoadingHistory ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : taxHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tax reports available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Tax</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxHistory.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      RM {report.totalIncome.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      RM {report.totalDeductions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      RM {report.taxableIncome.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                      RM {report.estimatedTax.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tax Year Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Total Income</h3>
              <p className="text-2xl font-bold text-green-600">RM0.00</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Total Deductions</h3>
              <p className="text-2xl font-bold text-red-600">RM0.00</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Taxable Income</h3>
              <p className="text-2xl font-bold text-blue-600">RM0.00</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Estimated Tax</h3>
              <p className="text-2xl font-bold text-purple-600">RM0.00</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Income Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No income data available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Deductions Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No deduction data available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 