/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UploadSection } from './components/UploadSection';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalysisData } from './types';
import { Wallet, Sun, Moon } from 'lucide-react';

export default function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">SpendSense AI</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!analysisData ? (
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
                Understand your spending instantly.
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Upload your bank statement or credit card bill. Our AI will automatically categorize transactions, find hidden subscriptions, and give you actionable tips to save money.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-200">
              <UploadSection onUploadSuccess={setAnalysisData} />
            </div>
          </div>
        ) : (
          <AnalysisDashboard 
            data={analysisData} 
            onReset={() => setAnalysisData(null)} 
          />
        )}
      </main>
    </div>
  );
}
