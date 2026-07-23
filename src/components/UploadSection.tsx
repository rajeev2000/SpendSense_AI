import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../utils';

interface UploadSectionProps {
  onUploadSuccess: (data: any) => void;
}

export function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('statement', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to analyze statement');
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer",
          isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
          file && !isDragging && "bg-white dark:bg-gray-900"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="application/pdf,image/jpeg,image/png,image/webp"
        />
        
        {file ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">Upload your statement</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag and drop a PDF or Image, or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Analyzing Statement...
            </>
          ) : (
            'Analyze Statement'
          )}
        </button>
      )}
    </div>
  );
}
