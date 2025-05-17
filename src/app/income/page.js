'use client';

import React, { useState, useEffect } from 'react';

export default function IncomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: '',
    description: '',
    category: ''
  });
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/income');
      const result = await response.json();
      
      if (result.success) {
        setIncomes(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch income history');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Start document analysis
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success && result.data) {
          // Auto-fill the form with extracted data
          setFormData(prev => ({
            ...prev,
            amount: result.data.amount || '',
            source: result.data.source || '',
            date: result.data.date || '',
            description: result.data.description || '',
            category: result.data.category || ''
          }));
        } else {
          setError(result.message || 'Failed to analyze document');
        }
      } catch (error) {
        setError('Error analyzing document');
        console.error('Error:', error);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Income added successfully');
        setFormData({
          amount: '',
          source: '',
          date: '',
          description: '',
          category: ''
        });
        setSelectedFile(null);
        fetchIncomes(); // Refresh the income list
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to add income');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/income?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setSuccess('Income deleted successfully');
        // Remove the deleted income from the state
        setIncomes(prevIncomes => prevIncomes.filter(income => income._id !== id));
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to delete income');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Income Tracking</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Document
              </label>
              <div className="mt-1 flex items-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose file
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {analyzing ? 'Analyzing document...' : selectedFile ? selectedFile.name : 'No file selected'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload a supporting document (image or PDF) to automatically fill the form
              </p>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter income source"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter description (optional)"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter category (optional)"
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
        <div>
          <h2 className="text-xl font-semibold mb-4">Income History</h2>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          ) : incomes.length === 0 ? (
            <p className="text-gray-500">No income entries yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomes.map((income) => (
                    <tr key={income._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(income.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${income.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDelete(income._id)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 