'use client';

import React, { useState, useEffect } from 'react';

export default function ExpensesPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses?userId=user123'); // Replace with actual user ID
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.name.split('.').pop().toLowerCase();
      
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: 'user123', // Replace with actual user ID
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        setFormData({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        fetchExpenses(); // Refresh the expenses list
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

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
          
          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
          
          {analysisData && renderExpenseChart()}
        </div>
      </div>

      {/* Manual Expense Entry Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Expense Manually</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              <option value="food">Food & Dining</option>
              <option value="transportation">Transportation</option>
              <option value="housing">Housing</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter expense description"
              required
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>

      {/* Expense History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Expense History</h2>
        <div className="space-y-4">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No expense entries yet</p>
          )}
        </div>
      </div>
    </div>
  );
}