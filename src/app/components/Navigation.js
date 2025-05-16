'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🧞‍♂️</span>
            <span className="font-bold text-xl">Tax Genie</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/income"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/income')}`}
            >
              Income
            </Link>
            <Link
              href="/expenses"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/expenses')}`}
            >
              Expenses
            </Link>
            <Link
              href="/tax-report"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/tax-report')}`}
            >
              Tax Report
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
            >
              Profile
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/income"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/income')}`}
          >
            Income
          </Link>
          <Link
            href="/expenses"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/expenses')}`}
          >
            Expenses
          </Link>
          <Link
            href="/tax-report"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/tax-report')}`}
          >
            Tax Report
          </Link>
          <Link
            href="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile')}`}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
} 