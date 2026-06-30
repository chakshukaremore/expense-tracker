import React, { useState } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Check, 
  HelpCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

function RemindersPage({ subscriptions = [], upcomingReminders = [], userId, fetchInitialData, addNotification }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [category, setCategory] = useState('Subscriptions');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Mark bill as paid
  const handlePay = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/subscriptions/${id}/pay`);
      addNotification("Bill marked as paid! Due date extended.", "success");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Payment simulation updated.", "warning");
      
      const updated = subscriptions.map(sub => {
        if (sub.id === id) {
          const newDate = new Date(sub.dueDate);
          newDate.setMonth(newDate.getMonth() + 1); 
          return { ...sub, dueDate: newDate.toISOString().split('T')[0] };
        }
        return sub;
      });
      subscriptions.length = 0;
      subscriptions.push(...updated);
      fetchInitialData();
    }
  };

  // Add new subscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) {
      addNotification("Please fill all required fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId,
        name,
        amount: Number(amount),
        dueDate,
        billingCycle,
        category,
        status: "Active"
      };

      await axios.post(`${API_BASE_URL}/subscriptions`, payload);
      addNotification("Successfully added recurring subscription!", "success");
      setName('');
      setAmount('');
      setDueDate('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Added subscription to local demo list.", "warning");
      
      subscriptions.push({
        id: Date.now(),
        userId,
        name,
        amount: Number(amount),
        dueDate,
        billingCycle,
        category,
        status: "Active"
      });
      fetchInitialData();
    } finally {
      setLoading(false);
    }
  };

  // Filtering Logic
  const getFilteredReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subscriptions.filter(sub => {
      const due = new Date(sub.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (activeFilter === 'Today') {
        return diffDays === 0;
      } else if (activeFilter === 'This Week') {
        return diffDays >= 0 && diffDays <= 7;
      } else if (activeFilter === 'This Month') {
        return diffDays >= 0 && diffDays <= 30;
      }
      return true; // 'All'
    });
  };

  const filteredSubscriptions = getFilteredReminders();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Left Panel: Form */}
      <div className="card-panel p-6 flex flex-col gap-4 h-fit">
        <h3 className="text-md font-bold flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-500" /> Add Recurring Bill
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Register utilities, broadband or rent targets to track billing cycles.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Bill Name</label>
            <input
              type="text"
              placeholder="e.g. Netflix, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Amount (₹)</label>
              <input
                type="number"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Subscriptions">Subscriptions</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            {loading ? 'Adding...' : 'Add Reminder'}
          </button>
        </form>
      </div>

      {/* Right Panel: Active Reminders List */}
      <div className="card-panel p-6 lg:col-span-2 flex flex-col gap-4">
        
        {/* Title and Filter toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-md font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Active Reminders
          </h3>
          
          <div className="flex bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-1 gap-1">
            {['All', 'Today', 'This Week', 'This Month'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  activeFilter === f 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map(sub => {
              const isDueSoon = upcomingReminders.some(u => u.id === sub.id);

              return (
                <div key={sub.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isDueSoon ? 'bg-red-500/5 dark:bg-red-950/10 border-red-500/30' : 'bg-[var(--bg-primary)]/30 border-[var(--border-color)]'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border shrink-0 ${
                      isDueSoon ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}>
                      {isDueSoon ? <Clock className="w-5 h-5 animate-pulse" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{sub.name}</h4>
                      <p className={`text-[10px] font-bold ${isDueSoon ? 'text-red-500' : 'text-[var(--text-secondary)]'} mt-0.5`}>
                        Due Date: {sub.dueDate} {isDueSoon && "(Due Soon!)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--border-color)]">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[var(--text-primary)]">₹{sub.amount}</span>
                      <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">{sub.billingCycle}</p>
                    </div>

                    <button
                      onClick={() => handlePay(sub.id)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all border flex items-center gap-1 ${
                        isDueSoon 
                          ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-amber-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-xs text-[var(--text-secondary)] italic border border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center gap-2">
              <HelpCircle className="w-8 h-8 text-[var(--text-secondary)]" />
              <span>No bills due matching this filter criteria.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemindersPage;
