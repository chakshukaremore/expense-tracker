import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  Filter
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const API_BASE_URL = 'http://localhost:8080/api';

function ReportsPage({ userId, expenses = [], addNotification, isDarkMode }) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Filter logic
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
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vesta_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
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

  // Download CSV Report
  const handleDownloadCsv = async () => {
    setDownloadingCsv(true);
    try {
      addNotification("Compiling CSV transaction ledger...", "info");
      
      const response = await axios({
        url: `${API_BASE_URL}/reports/csv?userId=${userId}`,
        method: 'GET',
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vesta_Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addNotification("CSV statement downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: CSV compilation failed.", "error");
    } finally {
      setDownloadingCsv(false);
    }
  };

  // Chart data calculations
  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const chartColors = isDarkMode 
    ? ['#f59e0b', '#38bdf8', '#34d399', '#a78bfa', '#f87171', '#fb7185'] 
    : ['#d97706', '#0284c7', '#059669', '#7c3aed', '#dc2626', '#db2777'];

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: isDarkMode ? '#1e293b' : '#ffffff'
      }
    ]
  };

  // Line Chart calculation
  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
  const dailyTotals = sortedExpenses.reduce((acc, e) => {
    acc[e.date] = (acc[e.date] || 0) + e.amount;
    return acc;
  }, {});

  const lineData = {
    labels: Object.keys(dailyTotals),
    datasets: [
      {
        label: 'Daily Expenditure (₹)',
        data: Object.values(dailyTotals),
        fill: true,
        borderColor: isDarkMode ? '#f59e0b' : '#d97706',
        backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(217, 119, 6, 0.05)',
        tension: 0.3,
        pointBackgroundColor: isDarkMode ? '#f59e0b' : '#d97706',
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#94a3b8' : '#78716c',
          font: { family: 'Outfit', size: 10 }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? '#33415533' : '#f1ede450'
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#78716c',
          font: { family: 'Outfit', size: 9 }
        }
      },
      y: {
        grid: {
          color: isDarkMode ? '#33415533' : '#f1ede450'
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#78716c',
          font: { family: 'Outfit', size: 9 }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* 📊 Top Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pie Chart */}
        <div className="card-panel p-6 flex flex-col items-center justify-between min-h-[300px]">
          <h3 className="w-full text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-1.5">
            Category Breakdown
          </h3>
          <div className="flex-1 w-full h-[200px] flex items-center justify-center">
            {Object.keys(categoryTotals).length > 0 ? (
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <div className="text-xs text-[var(--text-secondary)] italic">No data matching filters</div>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="card-panel p-6 flex flex-col items-center justify-between min-h-[300px]">
          <h3 className="w-full text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-1.5">
            Spending Trends
          </h3>
          <div className="flex-1 w-full h-[200px] flex items-center justify-center">
            {Object.keys(dailyTotals).length > 0 ? (
              <Line data={lineData} options={chartOptions} />
            ) : (
              <div className="text-xs text-[var(--text-secondary)] italic">No data matching filters</div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📑 Left Panel: Export configs */}
        <div className="card-panel p-6 flex flex-col gap-5 justify-between h-fit">
          <div>
            <h3 className="text-md font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" /> Export Statements
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Download your statement ledger into an Excel sheet or a printable PDF.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-1.5 my-2">
            <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-500" /> Category Filter
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
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
              disabled={downloadingPdf || downloadingCsv}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {downloadingPdf ? 'Compiling PDF...' : 'Download PDF Statement'}
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={downloadingPdf || downloadingCsv}
              className="w-full py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-[var(--text-primary)] font-bold text-xs tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              {downloadingCsv ? 'Compiling CSV...' : 'Download CSV Statement'}
            </button>
          </div>
        </div>

        {/* 🧾 Right Panel: Filtered Table Preview */}
        <div className="card-panel p-6 lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Ledger Preview
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
              {filteredExpenses.length} records
            </span>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase font-bold text-[9px] tracking-wider">
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
                    <tr key={exp.id} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-primary)]/40 text-[var(--text-primary)] transition-all">
                      <td className="py-3.5 px-2">{exp.date}</td>
                      <td className="py-3.5 px-2 font-bold">{exp.merchant}</td>
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[9px] text-[var(--text-secondary)] font-bold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right text-[var(--text-secondary)]">₹{exp.tax}</td>
                      <td className="py-3.5 px-2 text-right font-extrabold text-[var(--accent-gold)]">
                        ₹{exp.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-[var(--text-secondary)] italic">
                      No expense records match the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default ReportsPage;
