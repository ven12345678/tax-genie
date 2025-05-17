'use client';

import React, { useState } from 'react';

export default function IncomePage() {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Income Tracking</h1>

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