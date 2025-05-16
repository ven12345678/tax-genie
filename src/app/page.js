'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Tax Genie</h1>
        <p className="text-xl text-gray-600">Your personal tax management assistant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/income" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">💰</div>
            <h2 className="text-xl font-semibold mb-2">Income Tracking</h2>
            <p className="text-gray-600">Track and manage your income sources</p>
          </div>
        </Link>

        <Link href="/expenses" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">Expenses Tracking</h2>
            <p className="text-gray-600">Monitor your deductible expenses</p>
          </div>
        </Link>

        <Link href="/tax-report" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">Tax Report</h2>
            <p className="text-gray-600">View your tax summary and estimates</p>
          </div>
        </Link>

        <Link href="/profile" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">👤</div>
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">Manage your personal information</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Income (YTD)</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses (YTD)</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Tax Due</span>
              <span className="font-semibold text-red-600">$0.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tax Filing Deadlines</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quarterly Estimated Tax Payment (Q1)</span>
            <span className="font-semibold">April 15, 2024</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quarterly Estimated Tax Payment (Q2)</span>
            <span className="font-semibold">June 15, 2024</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quarterly Estimated Tax Payment (Q3)</span>
            <span className="font-semibold">September 15, 2024</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quarterly Estimated Tax Payment (Q4)</span>
            <span className="font-semibold">January 15, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
