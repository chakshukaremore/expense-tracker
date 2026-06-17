import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Budgets from './components/Budgets';
import Reminders from './components/Reminders';
import SplitBills from './components/SplitBills';
import Reports from './components/Reports';

const API_BASE_URL = 'http://localhost:8080/api';
const DEFAULT_USER_ID = 1;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userId] = useState(DEFAULT_USER_ID);
  
  // App States
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [ledgerBalances, setLedgerBalances] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync API or fallback to mock
  useEffect(() => {
    fetchInitialData();
  }, [userId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Expenses (Mock fallback if failed)
      try {
        const expRes = await axios.get(`${API_BASE_URL}/reports/excel?userId=${userId}`); // Just to test api connectivity, or custom endpoint
        // Since we don't have list endpoint, let's load mock or get from server reports
        setExpenses(getMockExpenses());
      } catch (err) {
        setExpenses(getMockExpenses());
      }

      // 2. Fetch Budgets
      try {
        const budRes = await axios.get(`${API_BASE_URL}/budgets?userId=${userId}`);
        if (budRes.data && budRes.data.length > 0) {
          setBudgets(budRes.data);
        } else {
          setBudgets(getMockBudgets());
        }
      } catch (err) {
        setBudgets(getMockBudgets());
      }

      // 3. Fetch Subscriptions & Upcoming
      try {
        const subRes = await axios.get(`${API_BASE_URL}/subscriptions?userId=${userId}`);
        const upRes = await axios.get(`${API_BASE_URL}/subscriptions/upcoming?userId=${userId}`);
        setSubscriptions(subRes.data.length > 0 ? subRes.data : getMockSubscriptions());
        setUpcomingReminders(upRes.data.length > 0 ? upRes.data : getMockUpcoming());
      } catch (err) {
        setSubscriptions(getMockSubscriptions());
        setUpcomingReminders(getMockUpcoming());
      }

      // 4. Fetch Group Dues
      try {
        const memRes = await axios.get(`${API_BASE_URL}/groups/members?userId=${userId}`);
        const balRes = await axios.get(`${API_BASE_URL}/groups/balances?userId=${userId}`);
        setGroupMembers(memRes.data.length > 0 ? memRes.data : getMockFriends());
        setLedgerBalances(balRes.data.balances || getMockBalances());
      } catch (err) {
        setGroupMembers(getMockFriends());
        setLedgerBalances(getMockBalances());
      }

    } catch (e) {
      console.warn("Using fallback local mockup data due to server offline status.");
    } finally {
      setLoading(false);
    }
  };

  // Mock data definitions
  const getMockExpenses = () => [
    { id: 1, merchant: "Starbucks Coffee", date: "2026-06-12", amount: 350.0, tax: 18.0, category: "Food" },
    { id: 2, merchant: "Netflix Premium", date: "2026-06-10", amount: 649.0, tax: 0.0, category: "Subscriptions" },
    { id: 3, merchant: "Zara India", date: "2026-06-08", amount: 2499.0, tax: 120.0, category: "Shopping" },
    { id: 4, merchant: "Uber Rides", date: "2026-06-05", amount: 450.0, tax: 22.0, category: "Travel" }
  ];

  const getMockBudgets = () => [
    { id: 1, userId: 1, category: "Food", monthlyLimit: 5000.0, currentSpent: 4200.0 },
    { id: 2, userId: 1, category: "Shopping", monthlyLimit: 6000.0, currentSpent: 2499.0 },
    { id: 3, userId: 1, category: "Travel", monthlyLimit: 3000.0, currentSpent: 1250.0 },
    { id: 4, userId: 1, category: "Subscriptions", monthlyLimit: 2000.0, currentSpent: 649.0 }
  ];

  const getMockSubscriptions = () => [
    { id: 1, userId: 1, name: "Netflix Premium", amount: 649.0, billingCycle: "Monthly", dueDate: "2026-06-25", category: "Subscriptions", status: "Active" },
    { id: 2, userId: 1, name: "Spotify Individual", amount: 119.0, billingCycle: "Monthly", dueDate: "2026-06-15", category: "Subscriptions", status: "Active" },
    { id: 3, userId: 1, name: "ACT Fiber Broadband", amount: 825.0, billingCycle: "Monthly", dueDate: "2026-06-14", category: "Utilities", status: "Active" }
  ];

  const getMockUpcoming = () => [
    { id: 2, userId: 1, name: "Spotify Individual", amount: 119.0, billingCycle: "Monthly", dueDate: "2026-06-15", category: "Subscriptions", status: "Active" },
    { id: 3, userId: 1, name: "ACT Fiber Broadband", amount: 825.0, billingCycle: "Monthly", dueDate: "2026-06-14", category: "Utilities", status: "Active" }
  ];

  const getMockFriends = () => [
    { id: 1, name: "Amit Sharma", userId: 1 },
    { id: 2, name: "Priya Patel", userId: 1 },
    { id: 3, name: "Rohan Das", userId: 1 }
  ];

  const getMockBalances = () => ({
    "Amit Sharma": 450.0,
    "Priya Patel": -120.0,
    "Rohan Das": 0.0
  });

  const addNotification = (message, type = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Premium Navbar */}
      <header className="glass-panel mx-4 my-3 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-900/40">V</div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">VESTA AI</h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Smart Finance Engine</p>
          </div>
        </div>

        {/* Tab Selection */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'scanner', label: '📷 AI Scanner' },
            { id: 'budgets', label: '💰 Budgets' },
            { id: 'reminders', label: '🔔 Reminders' },
            { id: 'splitbills', label: '👥 Split Bills' },
            { id: 'reports', label: '📑 Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold text-slate-300">Live Client</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">C</div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {notifications.length > 0 && (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-sm flex items-center justify-between ${
              n.type === 'error' ? 'bg-red-950/80 border-red-500 text-red-200' :
              n.type === 'warning' ? 'bg-amber-950/80 border-amber-500 text-amber-200' :
              'bg-slate-900/90 border-violet-500 text-violet-200'
            }`}>
              <span>{n.message}</span>
              <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-xs ml-3 opacity-60 hover:opacity-100">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Nav Header */}
      <div className="flex md:hidden flex-wrap justify-center gap-2 px-4 mb-2">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'scanner', label: '📷 Scanner' },
          { id: 'budgets', label: '💰 Budgets' },
          { id: 'reminders', label: '🔔 Reminders' },
          { id: 'splitbills', label: '👥 Split' },
          { id: 'reports', label: '📑 Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl font-medium text-[10px] text-center transition-all min-w-[70px] ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold' 
                : 'bg-slate-900/60 border border-slate-800 text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-violet-500 animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Syncing Smart Engine Ledger...</p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <Dashboard 
            expenses={expenses}
            budgets={budgets}
            subscriptions={subscriptions}
            upcomingReminders={upcomingReminders}
            ledgerBalances={ledgerBalances}
            groupMembers={groupMembers}
            userId={userId}
            fetchInitialData={fetchInitialData}
            addNotification={addNotification}
          />
        ) : activeTab === 'scanner' ? (
          <Scanner 
            userId={userId}
            fetchInitialData={fetchInitialData}
            addNotification={addNotification}
          />
        ) : activeTab === 'budgets' ? (
          <Budgets
            budgets={budgets}
            userId={userId}
            fetchInitialData={fetchInitialData}
            addNotification={addNotification}
          />
        ) : activeTab === 'reminders' ? (
          <Reminders
            subscriptions={subscriptions}
            upcomingReminders={upcomingReminders}
            userId={userId}
            fetchInitialData={fetchInitialData}
            addNotification={addNotification}
          />
        ) : activeTab === 'splitbills' ? (
          <SplitBills
            groupMembers={groupMembers}
            ledgerBalances={ledgerBalances}
            userId={userId}
            fetchInitialData={fetchInitialData}
            addNotification={addNotification}
          />
        ) : (
          <Reports
            userId={userId}
            expenses={expenses}
            addNotification={addNotification}
          />
        )}
      </main>
    </div>
  );
}

export default App;
