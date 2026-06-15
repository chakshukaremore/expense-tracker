import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function Budgets({ budgets, userId, fetchInitialData, addNotification }) {
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
        currentSpent: 0.0 // reset spent or fetch existing
      };

      await axios.post(`${API_BASE_URL}/budgets`, payload);
      addNotification(`Successfully updated ${category} budget limit!`, "success");
      setMonthlyLimit('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Budget updated in local demo view.", "warning");
      
      // Fallback local state change
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 💰 Left Panel: Configure Budget limit form */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-200">💰 Configure Category Targets</h3>
        <p className="text-xs text-slate-400">Set monthly spending limits for different categories. The system triggers warnings when you approach limits.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {['Food', 'Shopping', 'Travel', 'Subscriptions', 'Utilities', 'Entertainment', 'Others'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase">Monthly Limit Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm tracking-wider shadow-lg hover:shadow-cyan-900/20"
          >
            {loading ? 'Saving...' : 'Set Budget Target'}
          </button>
        </form>
      </div>

      {/* 📊 Right Panel: Current budgets visual list */}
      <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-200">📊 Category Spending Limits</h3>
        <p className="text-xs text-slate-400">Current active monthly limits and real-time alerts engine evaluation.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {budgets.map(b => {
            const pct = (b.currentSpent / b.monthlyLimit) * 100;
            const isOver = pct >= 100;
            const isNear = pct >= 85 && pct < 100;

            return (
              <div key={b.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isOver ? 'bg-red-950/20 border-red-500/30 pulse-error' :
                isNear ? 'bg-amber-950/20 border-amber-500/30' :
                'bg-slate-900/40 border-slate-800'
              }`}>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">{b.category}</span>
                  <span className={isOver ? 'text-rose-400' : isNear ? 'text-amber-400' : 'text-slate-400'}>
                    ₹{b.currentSpent} / ₹{b.monthlyLimit}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isOver ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                      isNear ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                      'bg-gradient-to-r from-violet-600 to-cyan-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Usage: {Math.round(pct)}%</span>
                  {isOver ? (
                    <span className="text-rose-400 font-bold">⚠️ EXCEEDED</span>
                  ) : isNear ? (
                    <span className="text-amber-400 font-bold">⚠️ WARNING</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Budgets;
