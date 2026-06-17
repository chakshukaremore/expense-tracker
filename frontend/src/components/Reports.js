import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function Reports({ userId, expenses, addNotification }) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // Filter local preview transaction logs
  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory);

  // Download PDF Report
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      addNotification("Generating PDF report compiler...", "info");
      
      const response = await axios({
        url: `${API_BASE_URL}/reports/pdf?userId=${userId}`,
        method: 'GET',
        responseType: 'blob', // Important: receives binary data
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vesta_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addNotification("PDF report downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: PDF report compilation failed.", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Download Excel Report
  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      addNotification("Compiling Excel workbook sheets...", "info");
      
      const response = await axios({
        url: `${API_BASE_URL}/reports/excel?userId=${userId}`,
        method: 'GET',
        responseType: 'blob', // Important: receives binary data
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vesta_Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addNotification("Excel report downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Excel download failed.", "error");
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 📑 Left Panel: Export configurations */}
      <div className="glass-panel p-6 flex flex-col gap-5 justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-200">📑 Export Financial Reports</h3>
          <p className="text-xs text-slate-400 mt-1">Compile your transaction ledger into a clean Excel spreadsheet or a professional printable PDF statement.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-1.5 my-2">
          <label className="text-xs text-slate-400 font-semibold uppercase">Category Filter (Preview)</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Categories</option>
            {['Food', 'Shopping', 'Travel', 'Subscriptions', 'Utilities', 'Entertainment', 'Others'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || downloadingExcel}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-semibold text-sm tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            {downloadingPdf ? 'Compiling PDF...' : '📄 Download PDF Statement'}
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadingPdf || downloadingExcel}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-semibold text-sm tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            {downloadingExcel ? 'Compiling Excel...' : '📊 Download Excel Sheets'}
          </button>
        </div>
      </div>

      {/* 🧾 Right Panel: Filtered Table Preview */}
      <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-200">🧾 Export Ledger Preview</h3>
          <span className="text-xs text-slate-400">{filteredExpenses.length} Records found</span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Merchant</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2 text-right">Tax (₹)</th>
                <th className="py-3 px-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-800/40 hover:bg-slate-900/20 text-slate-300">
                    <td className="py-3.5 px-2">{exp.date}</td>
                    <td className="py-3.5 px-2 font-semibold text-slate-200">{exp.merchant}</td>
                    <td className="py-3.5 px-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-800 text-[10px] text-slate-400">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right text-slate-400">₹{exp.tax}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                      ₹{exp.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 italic">No expense records match criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
