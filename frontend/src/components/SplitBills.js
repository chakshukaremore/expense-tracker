import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function SplitBills({ groupMembers, ledgerBalances, userId, fetchInitialData, addNotification }) {
  const [newFriend, setNewFriend] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(groupMembers[0]?.name || '');
  const [loading, setLoading] = useState(false);

  // Add a friend
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
      
      // Fallback local simulation
      groupMembers.push({ id: Date.now(), name: newFriend.trim(), userId });
      ledgerBalances[newFriend.trim()] = 0.0;
      setSelectedFriend(newFriend.trim());
      setNewFriend('');
      fetchInitialData();
    } finally {
      setLoading(false);
    }
  };

  // Add bill split
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
        paidBy: "You", // default payer is active user
        owedBy: selectedFriend,
        amountOwed: Number(amount) / 2 // Equisplit assumption
      };

      await axios.post(`${API_BASE_URL}/groups/expenses`, payload);
      addNotification("Split transaction logged and balances recalculated!", "success");
      setDescription('');
      setAmount('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      addNotification("Spring Boot offline: Split logged locally.", "warning");
      
      // Fallback local balance recalculation
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
      
      // Fallback local balance clear
      ledgerBalances[friendName] = 0.0;
      fetchInitialData();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 👥 Left Panel: Forms to add friends and log split bills */}
      <div className="flex flex-col gap-6">
        
        {/* Add Friend Form */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-md font-bold text-slate-200">👥 Add Group Friend</h3>
          <form onSubmit={handleAddFriend} className="flex gap-2">
            <input
              type="text"
              placeholder="Friend Name"
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm"
            >
              Add
            </button>
          </form>
        </div>

        {/* Split Bill Form */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-md font-bold text-slate-200">⚖️ Split a Bill</h3>
          <form onSubmit={handleAddSplit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Description</label>
              <input
                type="text"
                placeholder="e.g. Dinner, Cab Fare"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Bill Amount (₹)</label>
              <input
                type="number"
                placeholder="₹ Total bill amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">Split With</label>
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
              >
                <option value="">Select Friend</option>
                {groupMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <p className="text-[10px] text-slate-500 italic">Assumption: Bill will be divided equally (50-50 Split) between You and the selected friend.</p>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm tracking-wider shadow-lg hover:shadow-cyan-900/20"
            >
              Log Split Dues
            </button>
          </form>
        </div>
      </div>

      {/* 🧾 Right Panel: Live Ledger Balance Sheet */}
      <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-200">⚖️ Friends Ledger Balance Sheet</h3>
        <p className="text-xs text-slate-400">View net balances and settle pending bills with group members.</p>

        <div className="flex flex-col gap-3 mt-2">
          {Object.entries(ledgerBalances).map(([friendName, balance]) => {
            const isOwed = balance > 0;
            const isOwe = balance < 0;

            return (
              <div key={friendName} className={`p-4 rounded-xl border flex items-center justify-between ${
                isOwed ? 'bg-emerald-950/20 border-emerald-500/30' :
                isOwe ? 'bg-rose-950/20 border-rose-500/30' :
                'bg-slate-900/40 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isOwed ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' :
                    isOwe ? 'bg-rose-950 border border-rose-900 text-rose-400' :
                    'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}>
                    👤
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{friendName}</h4>
                    <p className={`text-[10px] font-bold ${
                      isOwed ? 'text-emerald-400' :
                      isOwe ? 'text-rose-400' :
                      'text-slate-500'
                    }`}>
                      {isOwed ? 'Owes you money' : isOwe ? 'You owe them money' : 'All settled up'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-sm font-extrabold ${
                    isOwed ? 'text-emerald-400' :
                    isOwe ? 'text-rose-400' :
                    'text-slate-400'
                  }`}>
                    {balance === 0 ? '₹0' : `${isOwe ? '-' : ''}₹${Math.abs(balance)}`}
                  </span>

                  {balance !== 0 && (
                    <button
                      onClick={() => handleSettle(friendName)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all border ${
                        isOwed 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 hover:bg-emerald-600'
                          : 'bg-rose-500 text-slate-950 border-rose-500 hover:bg-rose-600'
                      }`}
                    >
                      Settle Up
                    </button>
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

export default SplitBills;
