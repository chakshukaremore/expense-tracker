import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function Reminders({ subscriptions, upcomingReminders, userId, fetchInitialData, addNotification }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [category, setCategory] = useState('Subscriptions');
  const [loading, setLoading] = useState(false);

  // Mark bill as paid
  const handlePay = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/subscriptions/${id}/pay`);
      addNotification("Bill marked as paid! Due date extended.", "success");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Payment simulation updated.", "warning");
      
      // Fallback local simulation
      const updated = subscriptions.map(sub => {
        if (sub.id === id) {
          const newDate = new Date(sub.dueDate);
          newDate.setMonth(newDate.getMonth() + 1); // extend 1 month
          return { ...sub, dueDate: newDate.toISOString().split('T')[0] };
        }
        return sub;
      });
      subscriptions.length = 0; // Clear
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
      
      // Fallback local mockup add
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 🔔 Left Panel: Register Subscription */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-200">🔔 Add Recurring Bill</h3>
        <p className="text-xs text-slate-400">Add recurring bills (broadband, subscriptions, rent) to receive early warnings before due dates.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase">Bill / Service Name</label>
            <input
              type="text"
              placeholder="e.g. Broadband, Netflix"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Amount (₹)</label>
              <input
                type="number"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm tracking-wider shadow-lg hover:shadow-cyan-900/20"
          >
            {loading ? 'Adding...' : 'Add Subscription'}
          </button>
        </form>
      </div>

      {/* 📋 Right Panel: Active Subscriptions List */}
      <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-200">📋 Active Recurring Reminders</h3>
        <p className="text-xs text-slate-400">Review subscription cycles, billing timelines, and settle outstanding targets.</p>

        <div className="flex flex-col gap-3 mt-2">
          {subscriptions.map(sub => {
            // Check if upcoming (< 2 days)
            const isDueSoon = upcomingReminders.some(u => u.id === sub.id);

            return (
              <div key={sub.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDueSoon ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/40 border-slate-800'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                    isDueSoon ? 'bg-amber-950 border-amber-500/40 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    🔔
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{sub.name}</h4>
                    <p className={`text-[10px] font-bold ${isDueSoon ? 'text-rose-400' : 'text-slate-400'}`}>
                      Due: {sub.dueDate} {isDueSoon && "(Due Soon!)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-200">₹{sub.amount}</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{sub.billingCycle}</p>
                  </div>

                  <button
                    onClick={() => handlePay(sub.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all border ${
                      isDueSoon 
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold hover:bg-amber-600' 
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Mark Paid
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
