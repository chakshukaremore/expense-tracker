import React, { useState } from 'react';
import axios from 'axios';
import { 
  PiggyBank, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  PlusCircle, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

function BudgetsPage({ budgets = [], userId, fetchInitialData, addNotification }) {
  const [category, setCategory] = useState('Food');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monthlyLimit || isNaN(monthlyLimit) || Number(monthlyLimit) <= 0) {
      addNotification("Please enter a valid monthly limit amount", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId,
        category,
        monthlyLimit: Number(monthlyLimit),
        currentSpent: 0.0 
      };

      await axios.post(`${API_BASE_URL}/budgets`, payload);
      addNotification(`Successfully updated ${category} budget limit!`, "success");
      setMonthlyLimit('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Budget updated in local demo view.", "warning");
      
      const index = budgets.findIndex(b => b.category === category);
      if (index !== -1) {
        budgets[index].monthlyLimit = Number(monthlyLimit);
      } else {
        budgets.push({ id: Date.now(), userId, category, monthlyLimit: Number(monthlyLimit), currentSpent: 0.0 });
      }
      fetchInitialData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* 💰 Left Panel: Form */}
      <div className="card-panel p-6 flex flex-col gap-4 h-fit">
        <h3 className="text-md font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" /> Configure Limit Targets
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Set monthly spending limits for category targets. The alert engine triggers soft warnings when approaching limits.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Select Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
            >
              {['Food', 'Shopping', 'Travel', 'Subscriptions', 'Utilities', 'Entertainment', 'Others'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Monthly Limit Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? 'Saving...' : 'Set Budget Limit'}
          </button>
        </form>
      </div>

      {/* 📊 Right Panel: Visual budget grid */}
      <div className="card-panel p-6 lg:col-span-2 flex flex-col gap-4">
        <h3 className="text-md font-bold flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-amber-500" /> Active Spending Limits
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Real-time tracking of active categories, aggregate spending ratios, and budget health statuses.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {budgets.length > 0 ? (
            budgets.map(b => {
              const pct = (b.currentSpent / b.monthlyLimit) * 100;
              const isOver = pct >= 100;
              const isNear = pct >= 85 && pct < 100;

              return (
                <div key={b.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3.5 transition-all ${
                  isOver ? 'bg-red-50/20 dark:bg-red-950/10 border-red-500/30' :
                  isNear ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-500/30' :
                  'bg-[var(--bg-primary)]/30 border-[var(--border-color)]'
                }`}>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[var(--text-primary)]">{b.category}</span>
                    <span className={isOver ? 'text-red-500' : isNear ? 'text-amber-500' : 'text-[var(--text-secondary)]'}>
                      ₹{b.currentSpent} / ₹{b.monthlyLimit}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                        isNear ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-[var(--text-secondary)]">Usage: {Math.round(pct)}%</span>
                    
                    <div className="flex items-center gap-1">
                      {isOver ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-red-500">EXCEEDED</span>
                        </>
                      ) : isNear ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-500">WARNING</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">ACTIVE</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-16 text-center text-xs text-[var(--text-secondary)] italic border border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center gap-2">
              <HelpCircle className="w-8 h-8 text-[var(--text-secondary)]" />
              <span>No budgets set yet. Use the configuration form on the left to set up limits.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetsPage;
