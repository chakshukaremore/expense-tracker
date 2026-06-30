import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import BudgetsPage from './pages/BudgetsPage';
import RemindersPage from './pages/RemindersPage';
import SplitBillsPage from './pages/SplitBillsPage';
import ReportsPage from './pages/ReportsPage';

const API_BASE_URL = 'http://localhost:8080/api';
const DEFAULT_USER_ID = 1;

function App() {
  const [userId] = useState(DEFAULT_USER_ID);
  
  // App States
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [ledgerBalances, setLedgerBalances] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Dark Mode state initialization
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Dark Mode side-effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  // Sync API or fallback to mock data
  useEffect(() => {
    fetchInitialData();
  }, [userId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Expenses from Database
      try {
        const expRes = await axios.get(`${API_BASE_URL}/expenses?userId=${userId}`);
        if (expRes.data && expRes.data.length > 0) {
          setExpenses(expRes.data);
        } else {
          setExpenses(getMockExpenses());
        }
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

      // 5. Fetch Analytics
      try {
        const anaRes = await axios.get(`${API_BASE_URL}/expenses/mom-analytics?userId=${userId}`);
        setAnalytics(anaRes.data);
      } catch (err) {
        setAnalytics({
          currentMonthTotal: 7799.0,
          prevMonthTotal: 7000.0,
          percentageChange: 11.41,
          highestCategoryChange: "Shopping",
          trend: "INCREASED"
        });
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

  // Notifications Drawer list helper
  const addNotification = (message, type = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [newNotif, ...prev]);
    // Also trigger animated toast
    addToast(message, type);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Toast stack helpers
  const addToast = (message, type = 'info') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Layout 
      notifications={notifications} 
      clearNotification={clearNotification}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {/* Central Routing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-amber-500 animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm font-semibold">Syncing Smart Engine Ledger...</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <DashboardPage 
              expenses={expenses}
              budgets={budgets}
              upcomingReminders={upcomingReminders}
              ledgerBalances={ledgerBalances}
              analytics={analytics}
              isDarkMode={isDarkMode}
            />
          } />
          
          <Route path="/scanner" element={
            <ScannerPage 
              userId={userId}
              fetchInitialData={fetchInitialData}
              addNotification={addNotification}
            />
          } />
          
          <Route path="/budgets" element={
            <BudgetsPage 
              budgets={budgets}
              userId={userId}
              fetchInitialData={fetchInitialData}
              addNotification={addNotification}
            />
          } />
          
          <Route path="/reminders" element={
            <RemindersPage 
              subscriptions={subscriptions}
              upcomingReminders={upcomingReminders}
              userId={userId}
              fetchInitialData={fetchInitialData}
              addNotification={addNotification}
            />
          } />
          
          <Route path="/split-bills" element={
            <SplitBillsPage 
              groupMembers={groupMembers}
              ledgerBalances={ledgerBalances}
              userId={userId}
              fetchInitialData={fetchInitialData}
              addNotification={addNotification}
            />
          } />
          
          <Route path="/reports" element={
            <ReportsPage 
              userId={userId}
              expenses={expenses}
              addNotification={addNotification}
              isDarkMode={isDarkMode}
            />
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}

      {/* Floating Animated Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default App;
