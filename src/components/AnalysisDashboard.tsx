import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Lightbulb, DollarSign, RefreshCw, TrendingDown, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AnalysisData } from '../types';
import { formatCurrency } from '../utils';

interface AnalysisDashboardProps {
  data: AnalysisData;
  onReset: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function AnalysisDashboard({ data, onReset }: AnalysisDashboardProps) {
  const { summary, insights, subscriptions, transactions, currency } = data;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Financial Analysis Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Insights extracted from your statement</p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Upload New File
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-center transition-colors duration-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Spent</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
            {formatCurrency(summary.totalSpent || 0, currency)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm transition-colors duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg">
              <Lightbulb className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200">AI Actionable Insights</h3>
          </div>
          <ul className="space-y-3">
            {insights && insights.length > 0 ? insights.map((insight, idx) => (
              <li key={idx} className="flex items-start">
                <ArrowUpRight className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-indigo-900 dark:text-indigo-200">{insight}</span>
              </li>
            )) : (
              <li className="text-sm text-indigo-700 dark:text-indigo-400">No specific insights generated.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Bar Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Top Spending Categories</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.topCategories} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value, currency).replace(/\.00$/, '')} stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-text, #000)' }}
                  cursor={{fill: 'var(--tooltip-cursor, #f3f4f6)'}}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {summary.topCategories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col transition-colors duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recurring Subscriptions</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[250px]">
            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((sub, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {sub.merchantName || sub.name}
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(sub.amount, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-900 rounded-md text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      {sub.frequency}
                    </span>
                    {sub.suggestion && (
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {sub.suggestion}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No recurring subscriptions detected.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Transactions Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Date</th>
                <th className="px-4 py-3">Merchant / Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions && transactions.slice(0, 10).map((tx, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{tx.merchantName || 'Unknown Merchant'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-xs" title={tx.description}>{tx.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(tx.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
