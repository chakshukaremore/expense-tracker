import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function Scanner({ userId, fetchInitialData, addNotification }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState([]);
  const [scannedResult, setScannedResult] = useState(null);

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
      
      fetchInitialData(); // Sync parent dashboard state
    } catch (err) {
      addConsoleLog(`ERROR: Receipt parsing pipeline failed.`);
      addConsoleLog(`Reason: ${err.message}`);
      addNotification("Server offline or Gemini execution failed. Try Mock Upload!", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // Mock Upload (for local testing without database or files)
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
      
      fetchInitialData(); // Sync parent
    } catch (err) {
      addConsoleLog(`ERROR: Backend connection refused.`);
      addConsoleLog(`Reason: ${err.message}`);
      addNotification("Spring Boot backend offline!", "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 📷 Left Pane: Upload receipt panel */}
      <div className="glass-panel p-6 flex flex-col gap-5 justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-200">📷 AI Multimodal Receipt Scanner</h3>
          <p className="text-xs text-slate-400 mt-1">Upload any receipt image (JPEG/PNG). Google Gemini will extract all line items, tax, total amounts, and categorise it in real-time.</p>
        </div>

        {/* Upload Container */}
        <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
          isScanning ? 'border-cyan-500 bg-cyan-950/10 animate-scan' : 'border-slate-800 hover:border-violet-500/50 bg-slate-900/30'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center text-2xl shadow-inner">
            {isScanning ? '🧬' : '📥'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">
              {selectedFile ? selectedFile.name : 'Choose or Drop Receipt Image'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Accepts images up to 5MB</p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={isScanning}
            className="hidden" 
            id="receipt-file-input"
          />
          <label 
            htmlFor="receipt-file-input" 
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold tracking-wider text-slate-200 cursor-pointer border border-slate-700"
          >
            Browse Files
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleUpload}
            disabled={isScanning || !selectedFile}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-semibold text-sm tracking-wider shadow-lg hover:shadow-cyan-900/20"
          >
            {isScanning ? 'Scanning...' : 'Analyze Receipt'}
          </button>
          
          <button 
            onClick={handleMockUpload}
            disabled={isScanning}
            className="px-4 py-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Mock Scanner (Domino's)
          </button>
        </div>
      </div>

      {/* 🖥️ Right Pane: Developer OCR Console & Alert Engine Checks */}
      <div className="flex flex-col gap-6">
        
        {/* Terminal logs */}
        <div className="glass-panel p-6 flex-1 flex flex-col min-h-[200px] bg-black/40">
          <h3 className="text-xs font-extrabold tracking-widest text-slate-500 uppercase mb-3">🖥️ OCR Gemini Pipeline Console Log</h3>
          
          <div className="flex-1 overflow-y-auto font-mono text-[11px] text-cyan-400 flex flex-col gap-2 p-3 bg-black/60 border border-slate-900 rounded-xl min-h-[160px] max-h-[220px]">
            {scanProgress.length > 0 ? (
              scanProgress.map((log, index) => (
                <div key={index} className="leading-5">
                  <span className="text-violet-400">&gt;</span> {log}
                </div>
              ))
            ) : (
              <span className="text-slate-600 italic">Waiting for analysis sequence initiation...</span>
            )}
          </div>
        </div>

        {/* Saved Results details */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-slate-300 mb-4">Saved Receipt Details</h3>
          
          {scannedResult && scannedResult.expense ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Merchant</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{scannedResult.expense.merchant}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Category</span>
                  <p className="text-sm font-bold text-cyan-400 mt-0.5">{scannedResult.expense.category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Date</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{scannedResult.expense.date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Amount</span>
                  <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mt-0.5">
                    ₹{scannedResult.expense.amount} <span className="text-[10px] text-slate-500">(Tax: ₹{scannedResult.expense.tax})</span>
                  </p>
                </div>
              </div>

              {/* Alert notification preview */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                scannedResult.overBudget ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="text-xl">{scannedResult.overBudget ? '⚠️' : '✅'}</div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-300">Alert Engine Checks</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{scannedResult.alertMessage}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-600 text-xs italic">
              No receipt scanned yet. Perform an analysis to view saved database details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scanner;
