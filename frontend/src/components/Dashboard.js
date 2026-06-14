import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard({ 
  expenses, 
  budgets, 
  upcomingReminders, 
  ledgerBalances,
  addNotification 
}) {
  
  // Calculate aggregate metrics
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group split metrics
  const friendsBalances = Object.entries(ledgerBalances);
  const youAreOwed = friendsBalances.reduce((sum, [_, bal]) => bal > 0 ? sum + bal : sum, 0);
  const youOwe = friendsBalances.reduce((sum, [_, bal]) => bal < 0 ? sum + Math.abs(bal) : sum, 0);

  // Category chart configurations
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#8b5cf6', // Violet
          '#06b6d4', // Cyan
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#ef4444'  // Rose
        ],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e2e8f0',
          font: { family: 'Outfit', size: 12 }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 🚀 Top Row: Premium Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl"></div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Spent</span>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mt-2">
              ₹{totalSpent.toLocaleString('en-IN')}
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Across all configured categories</p>
        </div>

        {/* You Are Owed */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl"></div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">You Are Owed (Friends Split)</span>
            <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
              ₹{youAreOwed.toLocaleString('en-IN')}
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Pending settlement from friends</p>
        </div>

        {/* You Owe */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-2xl"></div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">You Owe (Friends Split)</span>
            <h2 className="text-3xl font-extrabold text-rose-400 mt-2">
              ₹{youOwe.toLocaleString('en-IN')}
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">Required to settle up with group</p>
        </div>
      </div>

      {/* 📊 Middle Row: Budget Alerts & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Budget Alerts */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-md font-bold tracking-wide text-slate-200">⚠️ Active Budget Tracker (Alert Engine)</h3>
          
          <div className="flex flex-col gap-4 mt-2">
            {budgets.map(b => {
              const pct = (b.currentSpent / b.monthlyLimit) * 100;
              const isOver = pct >= 100;
              const isNear = pct >= 85 && pct < 100;
              
              return (
                <div key={b.id} className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  isOver ? 'bg-red-950/20 border-red-500/30 pulse-error' :
                  isNear ? 'bg-amber-950/20 border-amber-500/30' :
                  'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-300">{b.category}</span>
                    <span className={isOver ? 'text-rose-400' : isNear ? 'text-amber-400' : 'text-slate-400'}>
                      ₹{b.currentSpent} / ₹{b.monthlyLimit} ({Math.round(pct)}%)
                    </span>
                  </div>
                  
                  {/* Progress bar wrapper */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isOver ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                        isNear ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-violet-600 to-cyan-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>

                  {/* Warning Messages */}
                  {isOver && (
                    <span className="text-[11px] font-bold text-rose-400 mt-1">
                      ⚠️ Limit crossed! Please optimize your spending in {b.category}.
                    </span>
                  )}
                  {isNear && (
                    <span className="text-[11px] font-bold text-amber-400 mt-1">
                      ⚠️ Soft warning: You have crossed 85% of your {b.category} budget limit.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between min-h-[350px]">
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="text-md font-bold tracking-wide text-slate-200">📊 Spending Category Share</h3>
            <span className="text-xs text-slate-400">Month-over-Month share</span>
          </div>
          
          <div className="flex-1 w-full h-[240px] flex items-center justify-center">
            {Object.keys(categoryTotals).length > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <span className="text-sm text-slate-500">No expenses recorded yet</span>
            )}
          </div>
        </div>
      </div>

      {/* 📅 Bottom Row: Subscriptions & Ledger details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bill Reminders */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-md font-bold tracking-wide text-slate-200">🔔 Upcoming Bill Reminders (&le; 2 Days Warning)</h3>
          
          <div className="flex flex-col gap-3">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map(sub => (
                <div key={sub.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-950 flex items-center justify-center font-bold text-indigo-400 border border-indigo-900">
                      📅
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{sub.name}</h4>
                      <p className="text-[10px] text-rose-400 font-bold mt-0.5">Due date: {sub.dueDate} (Very Soon!)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-200">₹{sub.amount}</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{sub.billingCycle}</p>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-slate-500 py-6 text-center">No subscriptions due within next 2 days</span>
            )}
          </div>
        </div>

        {/* Transaction History log */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-md font-bold tracking-wide text-slate-200">🧾 Recent Transactions Log</h3>
          
          <div className="flex flex-col gap-3">
            {expenses.slice(0, 4).map(exp => (
              <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between hover:bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 font-bold text-sm">
                    {exp.category[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{exp.merchant}</h4>
                    <p className="text-[10px] text-slate-400">{exp.date} &bull; {exp.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                    ₹{exp.amount}
                  </span>
                  <p className="text-[10px] text-slate-500">Tax: ₹{exp.tax}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
