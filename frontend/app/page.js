'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const validTypes = ['text/csv', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(selected.type) &&
        !selected.name.endsWith('.csv') &&
        !selected.name.endsWith('.xlsx')) {
      setMessage('Only CSV or XLSX files are allowed.');
      setStatus('error');
      return;
    }
    setFile(selected);
    setStatus('idle');
    setMessage('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    validateAndSetFile(dropped);
  };

  const handleSubmit = async () => {
    if (!file || !email) {
      setMessage('Please provide both a file and an email.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setStatus('success');
      setMessage(data.message);
      setFile(null);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📊</div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Insight Automator</h1>
          <p className="text-gray-500 mt-1 text-sm">Upload your sales data → Get AI summary in your inbox</p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('fileInput').click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4
            ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
        >
          <input
            id="fileInput"
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="text-3xl mb-2">📁</div>
          {file ? (
            <p className="text-indigo-600 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-gray-500 font-medium">Drag & drop your file here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-gray-400 text-xs mt-2">Supports: .csv, .xlsx (max 5MB)</p>
            </>
          )}
        </div>

        {/* Email Input */}
        <input
  type="email"
  placeholder="Recipient email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm mb-4 text-gray-900 placeholder-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
/>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all
            ${status === 'loading'
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Generating Summary...
            </span>
          ) : '🚀 Generate & Send Summary'}
        </button>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm text-center">
            ✅ {message}
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
            ❌ {message}
          </div>
        )}
      </div>
    </main>
  );
}