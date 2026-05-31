import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import TransactionTable from '../components/TransactionTable';
import api from '../api/axios';
import { UploadCloud, FileCheck, FileX, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATE_HEADERS = ['Time', ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`), 'Amount'];

function generateTemplateCSV() {
  const header = TEMPLATE_HEADERS.join(',');
  const example1 = [406, -3.043541, -3.157307, 1.088463, 2.288644, 1.359805, -1.064823, 0.325574, -0.067794, -0.270953, -0.838587, -0.414575, -2.225635, -0.636661, -2.891497, 1.109969, -1.931049, -1.725546, -0.679628, -2.289083, -0.456299, -0.183811, -0.328660, -0.145900, -0.056482, -0.597710, 0.149620, 0.648177, -0.221450, 239.93].join(',');
  return `${header}\n${example1}`;
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  
  const [validationStats, setValidationStats] = useState(null);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setValidationStats(null);
    setValidRows([]);
    setInvalidRows([]);
    setPreviewData([]);
    setResults(null);
    setError('');
    setProgress(0);
  };

  const validateCSV = (file) => {
    setValidating(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      preview: 100, // Only parse first 100 rows to prevent browser freeze on 150MB files
      complete: (results) => {
        const data = results.data;
        const valid = [];
        const invalid = [];
        
        data.forEach((row, i) => {
          let isRowValid = true;
          for (let header of TEMPLATE_HEADERS) {
            if (row[header] === undefined || row[header] === null || isNaN(row[header])) {
              isRowValid = false;
              break;
            }
          }
          if (isRowValid) {
            valid.push(row);
          } else {
            invalid.push({ line: i + 2, data: row });
          }
        });

        setValidationStats({
          total: data.length,
          valid: valid.length,
          invalid: invalid.length,
        });
        setValidRows(valid);
        setInvalidRows(invalid);
        setPreviewData(valid.slice(0, 5));
        setValidating(false);
      },
      error: (err) => {
        setError('Error parsing CSV file');
        setValidating(false);
      }
    });
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file');
      return;
    }
    if (f.size > 150 * 1024 * 1024) {
      setError('File size must be under 150 MB');
      return;
    }
    resetState();
    setFile(f);
    validateCSV(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleUpload = async () => {
    if (validRows.length === 0) {
      setError('No valid rows to upload');
      return;
    }
    setLoading(true);
    setError('');
    
    // Use the raw file directly instead of rebuilding it in memory!
    // This prevents the browser from crashing on 150MB files.
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/transactions/predict-bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setResults(res.data);
      toast.success('Upload and analysis complete!');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!results?.transactions) return;
    const headers = [...TEMPLATE_HEADERS, 'prediction', 'confidence'].join(',');
    const rows = results.transactions.map((tx) => {
      const vals = TEMPLATE_HEADERS.map((h) => tx[h] ?? tx[h.toLowerCase()] ?? '');
      const pred = tx.prediction === 1 || tx.prediction === 'fraud' ? 'FRAUD' : 'LEGIT';
      const conf = tx.confidence ? (tx.confidence * 100).toFixed(2) + '%' : '';
      return [...vals, pred, conf].join(',');
    });
    downloadCSV([headers, ...rows].join('\n'), 'fraudshield_results.csv');
  };

  return (
    <div className="max-w-6xl space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Bulk Upload & Validate</h1>
          <p className="text-white/40 text-sm">Client-side validation before AI analysis</p>
        </div>
        <button
          onClick={() => downloadCSV(generateTemplateCSV(), 'fraudshield_template.csv')}
          className="bg-white/5 hover:bg-white/10 text-white/80 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {!validationStats && !results && (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-[#111116] hover:bg-white/[0.02]'
          }`}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UploadCloud className={`w-8 h-8 ${dragging ? 'text-indigo-400' : 'text-white/40'}`} />
          </div>
          <p className="text-white font-medium mb-1">Drag & drop your CSV file</p>
          <p className="text-white/40 text-sm mb-6">Max file size 150 MB</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Browse Files
          </button>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}

      {validating && (
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Validating data structure...</p>
        </div>
      )}

      {validationStats && !results && !validating && (
        <div className="space-y-6">
          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{file?.name}</h3>
                  <p className="text-white/40 text-sm">{formatBytes(file?.size)}</p>
                </div>
              </div>
              <button onClick={resetState} className="text-white/40 hover:text-white text-sm underline">Upload different file</button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-xs uppercase mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-white">{validationStats.total}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4">
                <p className="text-emerald-500/60 text-xs uppercase mb-1">Valid Rows</p>
                <p className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> {validationStats.valid}
                </p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4">
                <p className="text-red-500/60 text-xs uppercase mb-1">Invalid Rows</p>
                <p className="text-2xl font-bold text-red-400 flex items-center gap-2">
                  <FileX className="w-5 h-5" /> {validationStats.invalid}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white/80 text-sm font-medium mb-3">Data Preview (Valid Rows)</h4>
              <div className="overflow-x-auto border border-white/5 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/40">
                    <tr>
                      {TEMPLATE_HEADERS.slice(0, 6).map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                      <th className="px-4 py-2 font-medium">...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/70">
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        {TEMPLATE_HEADERS.slice(0, 6).map(h => <td key={h} className="px-4 py-2 truncate max-w-[100px]">{row[h]}</td>)}
                        <td className="px-4 py-2 text-white/30">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || validationStats.valid === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Uploading... {progress}%</>
              ) : (
                <><UploadCloud className="w-5 h-5" /> Analyze Data File</>
              )}
            </button>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl text-center">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Analyzed Rows</p>
              <p className="text-3xl font-bold text-indigo-400">{results.total || 0}</p>
            </div>
            <div className="bg-[#111116] border border-red-500/20 p-5 rounded-2xl text-center">
              <p className="text-red-400/60 text-xs uppercase tracking-widest mb-2">Fraud Detected</p>
              <p className="text-3xl font-bold text-red-500">{results.fraud_count || 0}</p>
            </div>
            <div className="bg-[#111116] border border-amber-500/20 p-5 rounded-2xl text-center">
              <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-2">Risk Rate</p>
              <p className="text-3xl font-bold text-amber-500">
                {results.total ? `${((results.fraud_count / results.total) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>

          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Detection Results</h2>
              <button
                onClick={handleDownloadResults}
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <TransactionTable transactions={results.transactions || []} />
          </div>
        </div>
      )}
    </div>
  );
}
