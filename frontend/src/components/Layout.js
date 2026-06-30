import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scan, 
  PiggyBank, 
  BellRing, 
  Users, 
  BarChart3, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  User, 
  Wallet 
} from 'lucide-react';

function Layout({ children, notifications, clearNotification, isDarkMode, toggleDarkMode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Scanner', path: '/scanner', icon: Scan },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Reminders', path: '/reminders', icon: BellRing },
    { name: 'Split Bills', path: '/split-bills', icon: Users },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  // Get current page title
  const currentItem = navigationItems.find(item => item.path === location.pathname);
  const pageTitle = currentItem ? currentItem.name : 'Vesta AI';

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''} bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300`}>
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-0'
      } ${!isSidebarOpen && 'hidden md:flex'}`}>
        
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-bold text-white shadow-md shadow-amber-500/20 text-lg">V</div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-[var(--accent-gold)]">VESTA AI</h1>
              <p className="text-[9px] text-[var(--text-secondary)] tracking-widest uppercase font-semibold">Finance Engine</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] md:hidden">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/10' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[var(--border-color)] flex flex-col gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${isDarkMode ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Navbar */}
        <header className="h-16 px-4 md:px-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0 relative z-30">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-primary)] md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold tracking-tight md:text-xl capitalize">{pageTitle}</h2>
          </div>

          {/* Search bar & Dropdowns */}
          <div className="flex items-center gap-4">
            
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] w-60">
              <Search className="w-4 h-4 text-[var(--text-secondary)]" />
              <input 
                type="text" 
                placeholder="Search statements..."
                className="bg-transparent text-xs w-full focus:outline-none placeholder-[var(--text-secondary)]"
              />
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-[var(--bg-primary)] relative"
              >
                <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[var(--border-color)] flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                    {notifications.length > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-[var(--accent-gold)] px-2 py-0.5 rounded-full font-bold">{notifications.length} Pending</span>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-[var(--bg-primary)] flex items-start justify-between gap-3 text-xs border-b border-[var(--border-color)]/30 last:border-0">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{n.message}</p>
                            <span className="text-[9px] text-[var(--text-secondary)] mt-0.5 block">Alert Engine</span>
                          </div>
                          <button 
                            onClick={() => clearNotification(n.id)}
                            className="text-[10px] text-[var(--text-secondary)] hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-[var(--text-secondary)] italic">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--bg-primary)] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-[var(--accent-gold)]">
                  C
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[var(--border-color)]">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Chakshu Karemore</p>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">chakshu@example.com</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile Details
                    </button>
                    <button onClick={() => navigate('/budgets')} className="w-full text-left px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Wallets & Limits
                    </button>
                    <hr className="my-1 border-[var(--border-color)]" />
                    <button className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Page Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0 relative">
          {children}
        </main>

      </div>
    </div>
  );
}

export default Layout;
