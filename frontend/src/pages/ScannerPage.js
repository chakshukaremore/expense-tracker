import React, { useState } from 'react';
import axios from 'axios';
import { 
  Scan, 
  UploadCloud, 
  Terminal, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

function ScannerPage({ userId, fetchInitialData, addNotification }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState([]);
  const [scannedResult, setScannedResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const addConsoleLog = (msg) => {
    setScanProgress(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setScannedResult(null);
      setScanProgress([]);
      addConsoleLog(`File selected: ${e.target.files[0].name}`);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setScannedResult(null);
      setScanProgress([]);
      addConsoleLog(`File dropped: ${e.dataTransfer.files[0].name}`);
    }
  };

  // Real Upload
  const handleUpload = async () => {
    if (!selectedFile) {
      addNotification("Please select a receipt image first!", "warning");
      return;
    }

    setIsScanning(true);
    setScannedResult(null);
    setScanProgress([]);
    
    addConsoleLog("Initializing receipt analysis pipeline...");
    addConsoleLog("Connecting to Google Gemini API (gemini-1.5-flash)...");
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userId);

    try {
      addConsoleLog("Sending binary payload and OCR prompt...");
      const response = await axios.post(`${API_BASE_URL}/expenses/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      addConsoleLog("Gemini response received! Parsing JSON fields...");
      addConsoleLog("Successfully parsed Merchant, Date, Amount, Tax, and Category.");
      addConsoleLog("Triggering real-time Alert Engine checks...");

      const data = response.data;
      setScannedResult(data);
      addConsoleLog("Transaction details saved in database successfully.");
      
      if (data.overBudget) {
        addConsoleLog(`ALERT: ${data.alertMessage}`);
        addNotification(data.alertMessage, "error");
      } else {
        addConsoleLog("Ledger limits verification: SUCCESS.");
        addNotification("Receipt scanned and expense saved!", "success");
      }
      
      fetchInitialData(); 
    } catch (err) {
      addConsoleLog(`ERROR: Receipt parsing pipeline failed.`);
      addConsoleLog(`Reason: ${err.message}`);
      addNotification("Server offline or Gemini execution failed. Try Mock Upload!", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // Mock Upload
  const handleMockUpload = async () => {
    setIsScanning(true);
    setScannedResult(null);
    setScanProgress([]);

    addConsoleLog("Initializing simulated receipt pipeline...");
    addConsoleLog("Loading mock receipts binary resources...");
    
    try {
      addConsoleLog("Hitting mock scanner endpoint: /api/expenses/mock-upload...");
      const response = await axios.post(`${API_BASE_URL}/expenses/mock-upload?userId=${userId}`);
      
      addConsoleLog("Successfully fetched mock data: Dominos Pizza, ₹600.0, Category: Food.");
      addConsoleLog("Triggering Alert Engine validation...");

      const data = response.data;
      setScannedResult(data);
      addConsoleLog("Transaction details saved in DB successfully.");
      
      if (data.overBudget) {
        addConsoleLog(`ALERT: ${data.alertMessage}`);
        addNotification(data.alertMessage, "error");
      } else {
        addConsoleLog("Ledger limits verification: SUCCESS.");
        addNotification("Mock expense added successfully!", "success");
      }
      
      fetchInitialData(); 
    } catch (err) {
      addConsoleLog(`ERROR: Backend connection refused.`);
      addConsoleLog(`Reason: ${err.message}`);
      addNotification("Spring Boot backend offline!", "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      
      {/* 📷 Left Pane: Upload receipt panel */}
      <div className="card-panel p-6 flex flex-col gap-6 justify-between min-h-[460px]">
        <div>
          <h3 className="text-md font-bold flex items-center gap-2">
            <Scan className="w-5 h-5 text-amber-500" /> AI Multimodal Receipt Scanner
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Upload a receipt image. Google Gemini will extract merchant, date, tax, and category details in real-time.
          </p>
        </div>

        {/* Upload Container (Drag & Drop Zone) */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isScanning && document.getElementById('receipt-file-input').click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-amber-500 bg-amber-500/5' 
              : isScanning 
                ? 'border-amber-500 bg-amber-500/5 animate-pulse' 
                : 'border-[var(--border-color)] hover:border-amber-500/40 bg-[var(--bg-primary)]/40'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
            <UploadCloud className={`w-6 h-6 ${isScanning ? 'text-amber-500 animate-bounce' : 'text-[var(--text-secondary)]'}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {selectedFile ? selectedFile.name : 'Choose or Drag Receipt Image'}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Accepts images up to 5MB (PNG, JPG)</p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={isScanning}
            className="hidden" 
            id="receipt-file-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button 
            onClick={handleUpload}
            disabled={isScanning || !selectedFile}
            className="flex-1 py-3 rounded-xl bg-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-xs tracking-wider transition-all hover:bg-amber-600 shadow-md flex items-center justify-center gap-2"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isScanning ? 'Analyzing...' : 'Analyze Receipt'}
          </button>
          
          <button 
            onClick={handleMockUpload}
            disabled={isScanning}
            className="px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500 transition-all"
          >
            Simulate Domino's
          </button>
        </div>
      </div>

      {/* 🖥️ Right Pane: Console & Extracted details */}
      <div className="flex flex-col gap-6">
        
        {/* Terminal logs */}
        <div className="card-panel p-6 flex flex-col bg-slate-900 border-slate-950 dark:bg-slate-950 dark:border-slate-950">
          <h3 className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase mb-3 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" /> Pipeline Console Output
          </h3>
          
          <div className="flex-1 overflow-y-auto font-mono text-[10px] text-cyan-400 flex flex-col gap-2 p-3 bg-black/60 border border-slate-950 rounded-xl min-h-[140px] max-h-[140px]">
            {scanProgress.length > 0 ? (
              scanProgress.map((log, index) => (
                <div key={index} className="leading-4">
                  <span className="text-amber-500">&gt;</span> {log}
                </div>
              ))
            ) : (
              <span className="text-slate-600 italic">Waiting for analysis sequence initiation...</span>
            )}
          </div>
        </div>

        {/* Saved Results details */}
        <div className="card-panel p-6 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" /> Extracted Ledger Summary
            </h3>
          </div>
          
          {scannedResult && scannedResult.expense ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-primary)]/40 border border-[var(--border-color)] grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Merchant</span>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{scannedResult.expense.merchant}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Category</span>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">{scannedResult.expense.category}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Date</span>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{scannedResult.expense.date}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Total Amount</span>
                  <p className="text-xs font-bold text-[var(--accent-gold)] mt-0.5">
                    ₹{scannedResult.expense.amount} <span className="text-[9px] text-[var(--text-secondary)] font-normal">(Tax: ₹{scannedResult.expense.tax})</span>
                  </p>
                </div>
              </div>

              {/* Alert engine checks */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                scannedResult.overBudget ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <div className="shrink-0">
                  {scannedResult.overBudget 
                    ? <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> 
                    : <CheckCircle className="w-5 h-5 text-emerald-500" />
                  }
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Alert Engine Checks</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{scannedResult.alertMessage}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--text-secondary)] text-xs italic border border-dashed border-[var(--border-color)] rounded-xl">
              No receipt scanned yet. Perform an analysis to view saved database details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ScannerPage;
