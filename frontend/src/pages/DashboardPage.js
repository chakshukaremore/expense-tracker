import React from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Bell, 
  Calendar, 
  History, 
  Wallet,
  Coins,
  ArrowRight,
  Receipt,
  Users
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardPage({ 
  expenses = [], 
  budgets = [], 
  upcomingReminders = [], 
  ledgerBalances = {}, 
  analytics,
  isDarkMode
}) {
  
  // Calculations
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const friendsBalances = Object.entries(ledgerBalances);
  const youAreOwed = friendsBalances.reduce((sum, [_, bal]) => bal > 0 ? sum + bal : sum, 0);
  const youOwe = friendsBalances.reduce((sum, [_, bal]) => bal < 0 ? sum + Math.abs(bal) : sum, 0);

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const chartColors = isDarkMode 
    ? ['#f59e0b', '#38bdf8', '#34d399', '#a78bfa', '#f87171', '#fb7185'] 
    : ['#d97706', '#0284c7', '#059669', '#7c3aed', '#dc2626', '#db2777'];

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#94a3b8' : '#78716c',
          boxWidth: 12,
          padding: 15,
          font: { family: 'Outfit', size: 11, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        titleColor: isDarkMode ? '#f8fafc' : '#1c1917',
        bodyColor: isDarkMode ? '#94a3b8' : '#78716c',
        borderColor: isDarkMode ? '#334155' : '#f1ede4',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        bodyFont: { family: 'Outfit' },
        titleFont: { family: 'Outfit', weight: 'bold' }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold md:text-2xl text-[var(--text-primary)]">Welcome Back, Chef! 👋</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Here is an overview of your smart finance ledger stats.</p>
        </div>
        
        {/* Quick action grid */}
        <div className="flex gap-2 flex-wrap">
          <Link to="/scanner" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5">
            <Receipt className="w-3.5 h-3.5" /> Scan Receipt
          </Link>
          <Link to="/split-bills" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-amber-500 text-[var(--text-primary)] text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5">
            <Users className="w-3.5 h-3.5 text-amber-500" /> Split Dues
          </Link>
        </div>
      </div>

      {/* 💳 SaaS Statistic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Spent */}
        <div className="card-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Monthly Spent</span>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1.5">
                ₹{totalSpent.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] mt-4">
            <span>Across all active budgets</span>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="card-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">MoM Spending Growth</span>
              {analytics ? (
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <h2 className={`text-2xl font-extrabold ${
                    analytics.trend === 'INCREASED' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'
                  }`}>
                    {analytics.trend === 'INCREASED' ? '+' : ''}{analytics.percentageChange}%
                  </h2>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-[var(--text-secondary)] mt-1.5">No Data</h2>
              )}
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              analytics && analytics.trend === 'INCREASED' 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {analytics && analytics.trend === 'INCREASED' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] truncate mt-4">
            {analytics && analytics.highestCategoryChange && analytics.highestCategoryChange !== 'None'
              ? `Peak category: ${analytics.highestCategoryChange}` 
              : 'Analyzing spending trends...'}
          </div>
        </div>

        {/* You Are Owed */}
        <div className="card-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">You Are Owed</span>
              <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                ₹{youAreOwed.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-4">Pending group split settlements</div>
        </div>

        {/* You Owe */}
        <div className="card-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">You Owe</span>
              <h2 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1.5">
                ₹{youOwe.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-4">Required to clear ledger accounts</div>
        </div>

      </div>

      {/* 📊 Middle Row: Budget Alerts & Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Budget Alerts */}
        <div className="card-panel p-6 flex flex-col gap-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Active Budget Alert Engine
            </h3>
            <Link to="/budgets" className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5 hover:underline">
              Configure <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {budgets.length > 0 ? (
              budgets.slice(0, 4).map(b => {
                const pct = (b.currentSpent / b.monthlyLimit) * 100;
                const isOver = pct >= 100;
                const isNear = pct >= 85 && pct < 100;
                
                return (
                  <div key={b.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                    isOver ? 'bg-red-500/5 border-red-500/20 dark:bg-red-950/10' :
                    isNear ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-950/10' :
                    'bg-[var(--bg-primary)]/40 border-[var(--border-color)]'
                  }`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[var(--text-primary)]">{b.category}</span>
                      <span className={isOver ? 'text-red-500' : isNear ? 'text-amber-500' : 'text-[var(--text-secondary)]'}>
                        ₹{b.currentSpent} / ₹{b.monthlyLimit}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                          isNear ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                          'bg-gradient-to-r from-amber-500 to-amber-400'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className="text-[var(--text-secondary)]">{Math.round(pct)}% used</span>
                      {isOver && <span className="text-red-500 uppercase">Alert: Over Limit</span>}
                      {isNear && <span className="text-amber-500 uppercase">Warning: Near Limit</span>}
                      {!isOver && !isNear && <span className="text-emerald-500 uppercase">Healthy</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-[var(--text-secondary)] italic">
                No active category budgets. Go to Budgets to configure targets.
              </div>
            )}
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="card-panel p-6 flex flex-col items-center justify-between min-h-[320px]">
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" /> Spending Share
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-bold">MoM category metrics</span>
          </div>
          
          <div className="flex-1 w-full h-[220px] flex items-center justify-center relative">
            {Object.keys(categoryTotals).length > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="text-center text-xs text-[var(--text-secondary)] italic">
                No expenses logged yet
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 📅 Bottom Row: Subscriptions & Ledger details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Bill Reminders */}
        <div className="card-panel p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Upcoming Reminders (&le; 2 Days)
            </h3>
            <Link to="/reminders" className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5 hover:underline">
              Settle Bills <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.slice(0, 3).map(sub => (
                <div key={sub.id} className="p-3.5 rounded-xl bg-[var(--bg-primary)]/40 border border-[var(--border-color)] flex items-center justify-between hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{sub.name}</h4>
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">Due date: {sub.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[var(--text-primary)]">₹{sub.amount}</span>
                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">{sub.billingCycle}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-[var(--text-secondary)] italic border border-dashed border-[var(--border-color)] rounded-xl">
                No active recurring bills due within next 2 days
              </div>
            )}
          </div>
        </div>

        {/* Transaction History log */}
        <div className="card-panel p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" /> Recent Transactions Log
            </h3>
            <Link to="/reports" className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5 hover:underline">
              Ledger Preview <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {expenses.length > 0 ? (
              expenses.slice(0, 3).map(exp => (
                <div key={exp.id} className="p-3.5 rounded-xl bg-[var(--bg-primary)]/40 border border-[var(--border-color)] flex items-center justify-between hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-xs">
                      {exp.category[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{exp.merchant}</h4>
                      <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{exp.date} &bull; {exp.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[var(--accent-gold)]">
                      ₹{exp.amount}
                    </span>
                    <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Tax: ₹{exp.tax}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-[var(--text-secondary)] italic border border-dashed border-[var(--border-color)] rounded-xl">
                No expense transactions logged. Go to Scanner to add records.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default DashboardPage;
