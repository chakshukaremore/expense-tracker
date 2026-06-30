import React, { useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  Calculator, 
  Check, 
  HelpCircle,
  User
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

function SplitBillsPage({ groupMembers = [], ledgerBalances = {}, userId, fetchInitialData, addNotification }) {
  const [newFriend, setNewFriend] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(groupMembers[0]?.name || '');
  const [loading, setLoading] = useState(false);

  // Add friend
  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newFriend.trim()) {
      addNotification("Please enter a valid name", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = { userId, name: newFriend.trim() };
      await axios.post(`${API_BASE_URL}/groups/members`, payload);
      addNotification(`Successfully added ${newFriend} to group!`, "success");
      setNewFriend('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Friend added in local demo view.", "warning");
      
      groupMembers.push({ id: Date.now(), name: newFriend.trim(), userId });
      ledgerBalances[newFriend.trim()] = 0.0;
      setSelectedFriend(newFriend.trim());
      setNewFriend('');
      fetchInitialData();
    } finally {
      setLoading(false);
    }
  };

  // Add split bill
  const handleAddSplit = async (e) => {
    e.preventDefault();
    if (!description || !amount || isNaN(amount) || Number(amount) <= 0 || !selectedFriend) {
      addNotification("Please enter description, valid amount, and select a friend", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId,
        description,
        totalAmount: Number(amount),
        paidBy: "You", 
        owedBy: selectedFriend,
        amountOwed: Number(amount) / 2 
      };

      await axios.post(`${API_BASE_URL}/groups/expenses`, payload);
      addNotification("Split transaction logged and balances recalculated!", "success");
      setDescription('');
      setAmount('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Split logged locally.", "warning");
      
      const splitVal = Number(amount) / 2;
      ledgerBalances[selectedFriend] = (ledgerBalances[selectedFriend] || 0) + splitVal;
      setDescription('');
      setAmount('');
      fetchInitialData();
    } finally {
      setLoading(false);
    }
  };

  // Settle up balances
  const handleSettle = async (friendName) => {
    try {
      await axios.post(`${API_BASE_URL}/groups/settle?userId=${userId}&friendName=${friendName}`);
      addNotification(`Settled up with ${friendName}!`, "success");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Balance settled locally.", "warning");
      
      ledgerBalances[friendName] = 0.0;
      fetchInitialData();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* 👥 Left Panel: Split calculation modules */}
      <div className="flex flex-col gap-6">
        
        {/* Add Friend Form */}
        <div className="card-panel p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-amber-500" /> Add Group Friend
          </h3>
          <form onSubmit={handleAddFriend} className="flex gap-2">
            <input
              type="text"
              placeholder="Friend's Name"
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs tracking-wider transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {/* Split Bill Form */}
        <div className="card-panel p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-500" /> Split a Bill
          </h3>
          
          <form onSubmit={handleAddSplit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Description</label>
              <input
                type="text"
                placeholder="e.g. Dinner, Cab Fare"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Bill Amount (₹)</label>
              <input
                type="number"
                placeholder="₹ Total bill amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Split With</label>
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Select Friend</option>
                {groupMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <p className="text-[9px] text-[var(--text-secondary)] italic">Assumes a 50-50 split between You and the selected friend.</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs tracking-wider transition-colors shadow-md"
            >
              Log Split Dues
            </button>
          </form>
        </div>
      </div>

      {/* 🧾 Right Panel: Live Ledger Balance Sheet */}
      <div className="card-panel p-6 lg:col-span-2 flex flex-col gap-4">
        <h3 className="text-md font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" /> Friends Ledger balance
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Manage outstanding group debts, balances, and settle accounts dynamically.
        </p>

        <div className="flex flex-col gap-3 mt-2">
          {Object.entries(ledgerBalances).length > 0 ? (
            Object.entries(ledgerBalances).map(([friendName, balance]) => {
              const isOwed = balance > 0;
              const isOwe = balance < 0;

              return (
                <div key={friendName} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  isOwed ? 'bg-emerald-500/5 border-emerald-500/20' :
                  isOwe ? 'bg-red-500/5 border-red-500/20' :
                  'bg-[var(--bg-primary)]/30 border-[var(--border-color)]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      isOwed ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      isOwe ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}>
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{friendName}</h4>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${
                        isOwed ? 'text-emerald-500' :
                        isOwe ? 'text-red-500' :
                        'text-[var(--text-secondary)]'
                      } mt-0.5`}>
                        {isOwed ? 'Owes you money' : isOwe ? 'You owe them' : 'Settle-up: Complete'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-extrabold ${
                      isOwed ? 'text-emerald-600 dark:text-emerald-400' :
                      isOwe ? 'text-red-600 dark:text-red-400' :
                      'text-[var(--text-primary)]'
                    }`}>
                      {balance === 0 ? '₹0' : `${isOwe ? '-' : ''}₹${Math.abs(balance)}`}
                    </span>

                    {balance !== 0 && (
                      <button
                        onClick={() => handleSettle(friendName)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider transition-all border flex items-center gap-1 ${
                          isOwed 
                            ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                            : 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Settle
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-xs text-[var(--text-secondary)] italic border border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center gap-2">
              <HelpCircle className="w-8 h-8 text-[var(--text-secondary)]" />
              <span>No friends added yet. Add friends to log split bills.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SplitBillsPage;
