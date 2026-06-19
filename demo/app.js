// Global state management
let state = {
    expenses: [
        { id: 1, merchant: "Starbucks Coffee", date: "2026-06-01", amount: 450.00, tax: 22.50, category: "Food" },
        { id: 2, merchant: "Amazon India", date: "2026-06-02", amount: 3200.00, tax: 160.00, category: "Shopping" },
        { id: 3, merchant: "Uber Cab Ride", date: "2026-06-03", amount: 780.00, tax: 39.00, category: "Travel" },
        { id: 4, merchant: "Apollo Pharmacy", date: "2026-06-04", amount: 1200.00, tax: 60.00, category: "Medical" }
    ],
    budgets: {
        "Food": 5000,
        "Travel": 4000,
        "Shopping": 8000,
        "Utilities": 3000,
        "Medical": 2500
    },
    subscriptions: [
        { id: 1, name: "Netflix Premium", cost: 649, category: "Entertainment", dueDate: "2026-06-07", status: "Active" },
        { id: 2, name: "Airtel Wifi", cost: 999, category: "Bills", dueDate: "2026-06-06", status: "Active" },
        { id: 3, name: "Room Rent", cost: 12000, category: "Rent", dueDate: "2026-06-15", status: "Active" }
    ],
    friends: ["Amit Sharma", "Rahul Verma", "Priya Sen"],
    groupExpenses: [
        { id: 1, description: "Flat Dinner Party", amount: 2400.00, paidBy: "You", splits: ["You", "Amit Sharma", "Rahul Verma", "Priya Sen"] }
    ],
    balances: {
        "Amit Sharma": 600,  // Positive means they owe me
        "Rahul Verma": 600,
        "Priya Sen": 600
    },
    notifications: []
};

const BACKEND_URL = "http://localhost:8080/api";

// Global chart variables
let categoryChartInstance = null;

// Initialize app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Auth setup
    setupAuth();
    
    // Navigation setup
    setupNavigation();
    
    // Upload area events
    setupUploadZone();
    
    // Initialize components
    loadDashboardStats();
    renderExpensesTable();
    updateCharts();
    renderBudgets();
    renderSubscriptions();
    renderSplitDues();
    renderReports();
    checkRemindersEngine();
    checkBackendConnectivity();
});

// Check if Spring Boot backend is active
async function checkBackendConnectivity() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 sec timeout
        
        // Try hitting backend endpoints
        const response = await fetch(`${BACKEND_URL}/expenses`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log("Backend Connected successfully!");
            // Sync with backend data if connected
            const data = await response.json();
            if (data && data.length > 0) {
                state.expenses = data;
                renderExpensesTable();
                updateCharts();
                loadDashboardStats();
                renderBudgets();
            }
        }
    } catch (e) {
        console.warn("Spring Boot backend offline. Running in offline simulation mode.", e);
    }
}

// Navigation Controller
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            const tabName = item.getAttribute("data-tab");
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Hide all panels
    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    
    // Show selected panel
    const targetPanel = document.getElementById(`tab-${tabName}`);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }
    
    // Update Header Text
    const titles = {
        dashboard: { title: "Dashboard", subtitle: "Welcome back! Here's your financial overview." },
        scanner: { title: "AI Receipt Scanner", subtitle: "Extract receipt details automatically using Gemini AI." },
        budgets: { title: "Budgets & Smart Alerts", subtitle: "Configure limits and track logic layer warnings." },
        subscriptions: { title: "Subscriptions Manager", subtitle: "Monitor recurring bills and upcoming reminder systems." },
        split: { title: "Split Expenses", subtitle: "Divide bills equally or settle dues with friends." },
        reports: { title: "Export Reports", subtitle: "Download tax-compliant CSV or generate PDF statements." }
    };
    
    document.getElementById("page-title").textContent = titles[tabName].title;
    document.getElementById("page-subtitle").textContent = titles[tabName].subtitle;
    
    // Sidebar highlight helper (if switched programmatically)
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        if (item.getAttribute("data-tab") === tabName) {
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
        }
    });

    if (tabName === 'reports') {
        renderReports();
    }
}

// ----------------------------------------------------
// 1. Alert Engine: Core Logic Layer
// ----------------------------------------------------
function checkBudgetAlerts(category) {
    const limit = state.budgets[category];
    if (!limit) return; // Unmonitored category

    // Calculate total spent in this category
    const spent = state.expenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);

    const ratio = spent / limit;
    
    // Clear previous banners for this category to avoid clutter
    removeAlertBanner(category);

    if (ratio >= 1.0) {
        // Hard Limit Alert
        const alertMsg = `⚠️ Budget Exceeded! You have crossed your limit of ₹${limit} for ${category} (Spent: ₹${spent.toFixed(2)})`;
        triggerNotification('hard', alertMsg, category);
    } else if (ratio >= 0.85) {
        // Soft Warning Alert
        const alertMsg = `⚠️ Budget Warning: Spent total of ${category} has reached ${(ratio * 100).toFixed(0)}% of your ₹${limit} limit (Spent: ₹${spent.toFixed(2)})`;
        triggerNotification('soft', alertMsg, category);
    }
}

function triggerNotification(type, message, category) {
    // Add to state
    const notification = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        type: type,
        message: message,
        category: category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.notifications.unshift(notification);
    
    // Add banner to top of page
    const bannerContainer = document.getElementById("alert-banners-container");
    const banner = document.createElement("div");
    banner.className = `alert-banner ${type}`;
    banner.id = `alert-banner-${notification.id}`;
    
    const icon = type === 'hard' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation';
    banner.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
        <i class="fa-solid fa-xmark alert-close" onclick="closeBanner('${notification.id}')"></i>
    `;
    bannerContainer.prepend(banner);

    // Play visual feedback on notification bell
    updateNotificationDropdown();
}

function removeAlertBanner(category) {
    const bannerContainer = document.getElementById("alert-banners-container");
    const banners = bannerContainer.querySelectorAll(".alert-banner");
    banners.forEach(banner => {
        if (banner.querySelector("span").textContent.includes(category)) {
            banner.remove();
        }
    });
}

function closeBanner(id) {
    const banner = document.getElementById(`alert-banner-${id}`);
    if (banner) {
        banner.style.animation = 'fadeIn 0.2s reverse forwards';
        setTimeout(() => banner.remove(), 200);
    }
}

function updateNotificationDropdown() {
    const bellIcon = document.getElementById("bell-icon");
    const badge = document.getElementById("notification-count");
    const dropdownList = document.getElementById("dropdown-notifications-list");
    
    if (state.notifications.length > 0) {
        badge.classList.remove("hidden");
        badge.textContent = state.notifications.length;
        
        dropdownList.innerHTML = state.notifications.map(notif => {
            const icon = notif.type === 'hard' ? 'fa-triangle-exclamation text-danger' : 'fa-circle-exclamation text-warning';
            return `
                <div class="dropdown-item">
                    <i class="fa-solid ${icon}"></i>
                    <div class="content">
                        <span>${notif.message}</span>
                        <span class="time">${notif.timestamp}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        badge.classList.add("hidden");
        dropdownList.innerHTML = `<div class="empty-state">No new alerts</div>`;
    }
}

function toggleAlertsDropdown() {
    const dropdown = document.getElementById("notifications-dropdown");
    dropdown.classList.toggle("hidden");
}

function clearAllNotifications(event) {
    event.stopPropagation();
    state.notifications = [];
    updateNotificationDropdown();
    document.getElementById("alert-banners-container").innerHTML = '';
}

// ----------------------------------------------------
// 2. Subscription & Recurring Reminders Logic
// ----------------------------------------------------
function checkRemindersEngine() {
    const upcomingBox = document.getElementById("upcoming-reminders-box");
    upcomingBox.innerHTML = '';
    
    let dueCount = 0;
    const today = new Date();

    state.subscriptions.forEach(sub => {
        if (sub.status === 'Paid') return;

        const dueDateObj = new Date(sub.dueDate);
        const diffTime = dueDateObj - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Alert rule: 2 days before due date
        if (diffDays >= 0 && diffDays <= 2) {
            dueCount++;
            const isCritical = diffDays <= 0;
            const containerClass = isCritical ? 'reminder-card-due danger' : 'reminder-card-due';
            const statusText = isCritical ? '⚠️ OVERDUE / DUE TODAY' : `⚠️ Due in ${diffDays} days`;

            const card = document.createElement("div");
            card.className = containerClass;
            card.innerHTML = `
                <div class="reminder-card-due-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${sub.name}</h4>
                    <span class="${isCritical ? 'text-danger' : 'text-warning'}" style="font-weight:600;">₹${sub.cost}</span>
                </div>
                <p style="margin: 5px 0;">${statusText} (Due: ${sub.dueDate})</p>
                <button class="btn-pay" onclick="paySubscription(${sub.id})">Mark Paid</button>
            `;
            upcomingBox.appendChild(card);
        }
    });

    // Update Dashboard card counts
    document.getElementById("upcoming-bills-val").textContent = dueCount;
    if (dueCount > 0) {
        document.getElementById("upcoming-bills-text").innerHTML = `<i class="fa-solid fa-bell text-warning"></i> Action required: ${dueCount} urgent payments`;
    } else {
        document.getElementById("upcoming-bills-text").textContent = "All subscriptions current";
    }
}

function paySubscription(subId) {
    const sub = state.subscriptions.find(s => s.id === subId);
    if (sub) {
        sub.status = 'Paid';
        
        const expenseCategory = sub.category === 'Entertainment' ? 'Shopping' : 'Utilities';
        const newExpense = {
            id: Date.now(),
            merchant: `${sub.name} (Recurring)`,
            date: new Date().toISOString().split('T')[0],
            amount: sub.cost,
            tax: Math.round(sub.cost * 0.18 * 100) / 100, // 18% GST estimate
            category: expenseCategory
        };
        state.expenses.unshift(newExpense);
        
        loadDashboardStats();
        renderExpensesTable();
        updateCharts();
        renderSubscriptions();
        checkBudgetAlerts(expenseCategory);
        checkRemindersEngine();
        
        triggerNotification('soft', `✅ Paid recurring bill: ${sub.name} (₹${sub.cost}) auto-logged in ${expenseCategory}.`, 'Utilities');
    }
}

function saveSubscription() {
    const name = document.getElementById("sub-name").value;
    const cost = parseFloat(document.getElementById("sub-cost").value);
    const category = document.getElementById("sub-category").value;
    const dueDate = document.getElementById("sub-due-date").value;

    if (!name || isNaN(cost) || !dueDate) {
        alert("Please fill in all subscription details.");
        return;
    }

    const newSub = {
        id: Date.now(),
        name: name,
        cost: cost,
        category: category,
        dueDate: dueDate,
        status: "Active"
    };

    state.subscriptions.push(newSub);
    closeModal("subscription-modal");
    
    document.getElementById("sub-name").value = '';
    document.getElementById("sub-cost").value = '';
    document.getElementById("sub-due-date").value = '';

    renderSubscriptions();
    checkRemindersEngine();
}

function deleteSubscription(id) {
    state.subscriptions = state.subscriptions.filter(s => s.id !== id);
    renderSubscriptions();
    checkRemindersEngine();
}

function renderSubscriptions() {
    const tbody = document.getElementById("recurring-bills-tbody");
    tbody.innerHTML = '';

    state.subscriptions.forEach(sub => {
        const badgeClass = sub.status === 'Paid' ? 'badge-medical' : 'badge-travel';
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${sub.name}</strong></td>
            <td><span class="category-badge badge-other">${sub.category}</span></td>
            <td>₹${sub.cost.toFixed(2)}</td>
            <td>${sub.dueDate}</td>
            <td><span class="category-badge ${badgeClass}">${sub.status}</span></td>
            <td>
                <i class="fa-regular fa-trash-can btn-delete-icon" onclick="deleteSubscription(${sub.id})"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ----------------------------------------------------
// 3. Analytics & Visual Charts (Chart.js Layer)
// ----------------------------------------------------
function updateCharts() {
    const categoryTotals = { Food: 0, Travel: 0, Shopping: 0, Utilities: 0, Medical: 0 };
    
    state.expenses.forEach(exp => {
        if (categoryTotals[exp.category] !== undefined) {
            categoryTotals[exp.category] += exp.amount;
        }
    });

    const categories = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);
    
    const canvas = document.getElementById("categoryChartDashboard");
    if (!canvas) return;

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#f87171', // Food (Red)
                    '#60a5fa', // Travel (Blue)
                    '#f472b6', // Shopping (Pink)
                    '#fbbf24', // Utilities (Yellow)
                    '#34d399'  // Medical (Green)
                ],
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#8b9bb4',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        padding: 15
                    }
                }
            },
            cutout: '70%'
        }
    });

    renderMoMComparison(categoryTotals);
}

function renderMoMComparison(currentTotals) {
    const box = document.getElementById("comparison-analysis-box");
    if (!box) return;

    const currentSpent = Object.values(currentTotals).reduce((a, b) => a + b, 0);
    const previousSpent = 12500.00; // Simulated constant for MoM comparison
    
    const diff = currentSpent - previousSpent;
    const percent = ((diff / previousSpent) * 100).toFixed(1);
    
    let trendHTML = '';
    if (diff > 0) {
        trendHTML = `
            <h4>📈 Spent More (+${percent}% vs Last Month)</h4>
            <p>Your current spending is higher than last month's ₹${previousSpent}. Main driver: <strong>Food</strong> and <strong>Shopping</strong>.</p>
        `;
    } else {
        trendHTML = `
            <h4>📉 Smart Savings (${percent}% vs Last Month)</h4>
            <p>Incredible job! You spent less compared to last month's ₹${previousSpent} by ₹${Math.abs(diff).toFixed(0)}.</p>
        `;
    }
    box.innerHTML = trendHTML;
}

// ----------------------------------------------------
// 4. Export Expense Reports (Excel & PDF Generators)
// ----------------------------------------------------
function renderReports() {
    const tbody = document.getElementById("report-preview-tbody");
    if (!tbody) return;
    tbody.innerHTML = '';

    const catFilter = document.getElementById("report-category").value;
    const filtered = state.expenses.filter(exp => {
        return catFilter === 'all' || exp.category === catFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted text-center" style="text-align: center">No matching records found.</td></tr>`;
        return;
    }

    filtered.forEach(exp => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${exp.id}</td>
            <td><strong>${exp.merchant}</strong></td>
            <td>${exp.date}</td>
            <td><span class="category-badge badge-${exp.category.toLowerCase()}">${exp.category}</span></td>
            <td>₹${exp.amount.toFixed(2)}</td>
            <td>₹${exp.tax.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById("report-category").addEventListener("change", renderReports);

function exportData(type) {
    const category = document.getElementById("report-category").value;
    const filtered = state.expenses.filter(exp => {
        return category === 'all' || exp.category === category;
    });

    if (type === 'csv') {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Merchant Name,Billing Date,Category,Amount (INR),Tax Paid (INR)\n";
        
        filtered.forEach(exp => {
            csvContent += `"${exp.id}","${exp.merchant.replace(/"/g, '""')}","${exp.date}","${exp.category}",${exp.amount},${exp.tax}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Vesta_Expense_Report_${category}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } 
    else if (type === 'pdf') {
        // Styled Print Window for PDF Generation
        const printWindow = window.open('', '_blank');
        let tableRows = filtered.map(exp => `
            <tr>
                <td>#${exp.id}</td>
                <td>${exp.merchant}</td>
                <td>${exp.date}</td>
                <td>${exp.category}</td>
                <td>INR ${exp.amount.toFixed(2)}</td>
                <td>INR ${exp.tax.toFixed(2)}</td>
            </tr>
        `).join('');

        const totalAmt = filtered.reduce((s, e) => s + e.amount, 0);
        const totalTax = filtered.reduce((s, e) => s + e.tax, 0);

        printWindow.document.write(`
            <html>
            <head>
                <title>Vesta AI Expense Statement</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; }
                    h1 { color: #8b5cf6; margin: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #f3f4f6; padding: 12px; text-align: left; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .totals { text-align: right; margin-top: 30px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>VESTA AI</h1>
                        <p>Smart Financial Intelligence Expense System</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Merchant</th><th>Date</th><th>Category</th><th>Amount</th><th>Tax</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <div class="totals">
                    <p>Total Pre-Tax: INR ${(totalAmt - totalTax).toFixed(2)}</p>
                    <p>Tax Aggregation: INR ${totalTax.toFixed(2)}</p>
                    <p style="font-size: 18px; color: #8b5cf6">Total Combined: INR ${totalAmt.toFixed(2)}</p>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

// ----------------------------------------------------
// 5. Split Expenses with Friends (Group Billing)
// ----------------------------------------------------
function renderSplitDues() {
    const list = document.getElementById("split-ledger-list");
    if (!list) return;
    list.innerHTML = '';

    let hasDues = false;

    for (let friend in state.balances) {
        const val = state.balances[friend];
        if (Math.abs(val) < 0.01) continue;

        hasDues = true;
        const owerText = val > 0 ? 'owes you' : 'you owe';
        const colorClass = val > 0 ? 'text-success' : 'text-danger';
        const balanceVal = Math.abs(val).toFixed(2);

        const card = document.createElement("div");
        card.className = "ledger-item";
        card.innerHTML = `
            <div class="ledger-user">
                <div class="avatar">${friend[0]}</div>
                <div>
                    <h4>${friend}</h4>
                    <span class="${colorClass}">${owerText} ₹${balanceVal}</span>
                </div>
            </div>
            <div class="ledger-actions">
                <button class="btn btn-secondary btn-pay" style="padding: 6px 12px; font-size: 0.8rem;" onclick="settleFriend('${friend}')">Settle Up</button>
            </div>
        `;
        list.appendChild(card);
    }

    if (!hasDues) {
        list.innerHTML = `<div class="empty-state">🎉 All accounts are balanced! No dues.</div>`;
    }

    const netDues = Object.values(state.balances).reduce((sum, val) => sum + val, 0);
    const netValElement = document.getElementById("net-dues-val");
    const netTextElement = document.getElementById("net-dues-text");

    if (netDues >= 0) {
        netValElement.textContent = `₹${netDues.toFixed(2)}`;
        netValElement.className = "text-success";
        netTextElement.textContent = `Friends owe you ₹${netDues.toFixed(0)} total`;
    } else {
        netValElement.textContent = `₹${Math.abs(netDues).toFixed(2)}`;
        netValElement.className = "text-danger";
        netTextElement.textContent = `You owe friends ₹${Math.abs(netDues).toFixed(0)} total`;
    }

    renderSplitHistory();
}

function renderSplitHistory() {
    const container = document.getElementById("split-history-list");
    if (!container) return;
    container.innerHTML = '';

    state.groupExpenses.forEach(exp => {
        const item = document.createElement("div");
        item.className = "split-history-item";
        item.innerHTML = `
            <div>
                <span class="desc">${exp.description}</span>
                <div class="payer" style="font-size:0.8rem; color:var(--text-secondary);">Paid by: ${exp.paidBy}</div>
            </div>
            <span class="amount">₹${exp.amount.toFixed(2)}</span>
        `;
        container.appendChild(item);
    });
}

function submitSplitBill() {
    const desc = document.getElementById("split-desc").value;
    const amount = parseFloat(document.getElementById("split-amount").value);
    const payer = document.getElementById("split-payer").value;

    if (!desc || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid description and positive amount.");
        return;
    }

    const membersCount = state.friends.length + 1;
    const share = amount / membersCount;

    const newSplitExpense = {
        id: Date.now(),
        description: desc,
        amount: amount,
        paidBy: payer,
        splits: ["You", ...state.friends]
    };

    state.groupExpenses.unshift(newSplitExpense);

    if (payer === "You") {
        state.friends.forEach(f => {
            state.balances[f] += share;
        });
    } else {
        state.balances[payer] -= share;
    }

    document.getElementById("split-desc").value = '';
    document.getElementById("split-amount").value = '';
    document.getElementById("split-payer").selectedIndex = 0;

    renderSplitDues();
    loadDashboardStats();
    triggerNotification('soft', `👥 Split: "${desc}" (₹${amount.toFixed(2)}) split equally among group.`, 'Other');
}

function settleFriend(friendName) {
    const currentBal = state.balances[friendName];
    if (Math.abs(currentBal) < 0.01) return;

    state.balances[friendName] = 0;
    
    const logDesc = currentBal > 0 
        ? `Settlement: ${friendName} paid You` 
        : `Settlement: You paid ${friendName}`;
        
    state.groupExpenses.unshift({
        id: Date.now(),
        description: logDesc,
        amount: Math.abs(currentBal),
        paidBy: currentBal > 0 ? friendName : "You",
        splits: ["You", friendName]
    });

    renderSplitDues();
    loadDashboardStats();
    triggerNotification('soft', `💰 Settlement complete! ${logDesc} (₹${Math.abs(currentBal).toFixed(2)}).`, 'Other');
}

function addNewFriend() {
    const name = document.getElementById("friend-name").value;
    if (!name) return;

    state.friends.push(name);
    state.balances[name] = 0;

    const payerSelect = document.getElementById("split-payer");
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    payerSelect.appendChild(option);

    closeModal("friend-modal");
    document.getElementById("friend-name").value = '';
    renderFriendsList();
}

function renderFriendsList() {
    const container = document.getElementById("friends-list-container");
    container.innerHTML = state.friends.map(friend => `
        <div class="friend-pill">
            <span></span>
            ${friend}
        </div>
    `).join('');
}

// ----------------------------------------------------
// 6. Core: AI Receipt Scanning Simulator + Backend Link
// ----------------------------------------------------
function setupUploadZone() {
    const zone = document.getElementById("upload-zone");
    const input = document.getElementById("receipt-file-input");

    zone.addEventListener("click", () => input.click());

    input.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.style.borderColor = "var(--primary)";
    });

    zone.addEventListener("dragleave", () => {
        zone.style.borderColor = "rgba(139, 92, 246, 0.3)";
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });
}

function handleUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("upload-zone").classList.add("hidden");
        document.getElementById("scanner-loading-box").classList.remove("hidden");
        document.getElementById("receipt-preview-img").src = e.target.result;
        
        // Try uploading to backend, or run simulation fallback
        uploadToSpringBoot(file);
    };
    reader.readAsDataURL(file);
}

// REST Client: Hits the local Spring Boot backend upload endpoint
async function uploadToSpringBoot(file) {
    consoleLog("[System] Initiating POST request to Spring Boot...", "info");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

        consoleLog(`Connecting to: http://localhost:8080/api/expenses/upload?userId=1`, "muted");
        
        const response = await fetch(`${BACKEND_URL}/expenses/upload?userId=1`, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
            const result = await response.json();
            consoleLog(`Success! Status: 200 OK from Spring Boot server.`, "success");
            consoleLog(`Server response payload:<br>${JSON.stringify(result, null, 2)}`, "success");

            // Populate form
            const exp = result.expense;
            document.getElementById("ext-merchant").value = exp.merchant;
            document.getElementById("ext-amount").value = exp.amount;
            document.getElementById("ext-tax").value = exp.tax || 0;
            document.getElementById("ext-date").value = exp.date;
            document.getElementById("ext-category").value = exp.category;
            
            // Store the alert message if any
            if (result.alertMessage) {
                state.lastBackendAlert = {
                    message: result.alertMessage,
                    type: result.overBudget ? 'hard' : 'soft'
                };
            }

            document.getElementById("scanner-loading-box").classList.add("hidden");
            document.getElementById("extracted-form").classList.remove("hidden");
        } else {
            throw new Error(`Server returned status ${response.status}`);
        }
    } catch (err) {
        console.warn("Spring Boot connection failed. Running Gemini offline simulator.", err);
        consoleLog("Spring Boot offline. Falling back to offline client simulator...", "error");
        runScannerAIProcessing("random");
    }
}

function simulateScan(presetType) {
    document.getElementById("upload-zone").classList.add("hidden");
    document.getElementById("scanner-loading-box").classList.remove("hidden");
    
    const previews = {
        grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
        wifi: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60',
        restaurant: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
    };

    document.getElementById("receipt-preview-img").src = previews[presetType] || '';
    runScannerAIProcessing(presetType);
}

function consoleLog(msg, type = 'muted') {
    const consoleBox = document.getElementById("scanner-console");
    const line = document.createElement("div");
    line.className = `console-line text-${type}`;
    line.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function runScannerAIProcessing(presetType = 'random') {
    const statusText = document.getElementById("scanner-status-text");
    
    setTimeout(() => {
        statusText.textContent = "Connecting to Gemini 1.5 Flash client...";
        consoleLog("Initializing Google Gemini API connection...", 'muted');
    }, 600);

    setTimeout(() => {
        statusText.textContent = "Analyzing receipt pixel matrix...";
        consoleLog("Gemini model prompt: 'Analyze this receipt image. Extract Merchant Name...'", 'muted');
    }, 1500);

    setTimeout(() => {
        statusText.textContent = "Formatting extracted JSON payload...";
        consoleLog("Success! Status Code: 200 OK. Parsing token content...", 'info');
    }, 2400);

    setTimeout(() => {
        statusText.textContent = "Extraction successfully completed!";
        consoleLog("JSON response received from Gemini successfully.", 'info');
        
        const presets = {
            grocery: { merchant: "Big Bazaar Supermarket", amount: 2450.00, tax: 122.50, category: "Food", date: new Date().toISOString().split('T')[0] },
            wifi: { merchant: "Airtel Fiber Broadband", amount: 999.00, tax: 180.00, category: "Utilities", date: new Date().toISOString().split('T')[0] },
            restaurant: { merchant: "Pizza Hut Outlet", amount: 1580.00, tax: 79.00, category: "Food", date: new Date().toISOString().split('T')[0] },
            random: { merchant: "Apollo Pharmacy Store", amount: 620.00, tax: 31.00, category: "Medical", date: new Date().toISOString().split('T')[0] }
        };

        const result = presets[presetType] || presets.random;
        consoleLog(`Extracted Payload:<br>${JSON.stringify(result, null, 2)}`, 'success');
        
        document.getElementById("ext-merchant").value = result.merchant;
        document.getElementById("ext-amount").value = result.amount;
        document.getElementById("ext-tax").value = result.tax;
        document.getElementById("ext-date").value = result.date;
        document.getElementById("ext-category").value = result.category;

        document.getElementById("scanner-loading-box").classList.add("hidden");
        document.getElementById("extracted-form").classList.remove("hidden");
    }, 3200);
}

async function saveExtractedExpense() {
    const merchant = document.getElementById("ext-merchant").value;
    const amount = parseFloat(document.getElementById("ext-amount").value);
    const tax = parseFloat(document.getElementById("ext-tax").value) || 0;
    const date = document.getElementById("ext-date").value;
    const category = document.getElementById("ext-category").value;

    if (!merchant || isNaN(amount) || !date) {
        alert("Please make sure all extraction verification fields are set.");
        return;
    }

    const newExpense = {
        id: Date.now(),
        merchant: merchant,
        amount: amount,
        tax: tax,
        date: date,
        category: category
    };

    state.expenses.unshift(newExpense);
    resetScanner();
    loadDashboardStats();
    renderExpensesTable();
    updateCharts();
    
    // Check for alerts (Either from backend log or fallback locally)
    if (state.lastBackendAlert) {
        triggerNotification(state.lastBackendAlert.type, state.lastBackendAlert.message, category);
        state.lastBackendAlert = null;
    } else {
        checkBudgetAlerts(category);
    }

    switchTab("dashboard");
}

function resetScanner() {
    document.getElementById("extracted-form").classList.add("hidden");
    document.getElementById("scanner-loading-box").classList.add("hidden");
    document.getElementById("upload-zone").classList.remove("hidden");
    document.getElementById("receipt-file-input").value = '';
    document.getElementById("scanner-console").innerHTML = `<div class="console-line text-muted">[System] Ready. Upload an image to trigger GenAI parser...</div>`;
}

// ----------------------------------------------------
// Dashboard & Global Utilities
// ----------------------------------------------------
function loadDashboardStats() {
    const total = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById("total-spent-val").textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const activeBudgets = Object.keys(state.budgets).length;
    let monitoredSpent = 0;
    let totalLimit = 0;

    for (let cat in state.budgets) {
        totalLimit += state.budgets[cat];
        monitoredSpent += state.expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    }
    
    const overallRatio = totalLimit > 0 ? (monitoredSpent / totalLimit) * 100 : 0;
    
    document.getElementById("active-budgets-val").textContent = `${activeBudgets}/5`;
    document.getElementById("budget-overall-progress").style.width = `${Math.min(overallRatio, 100)}%`;
    document.getElementById("overall-budget-text").textContent = `${overallRatio.toFixed(0)}% of monthly limits used`;

    renderFriendsList();
}

function renderExpensesTable() {
    const tbody = document.getElementById("recent-expenses-tbody");
    tbody.innerHTML = '';

    state.expenses.forEach(exp => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${exp.merchant}</strong></td>
            <td>${exp.date}</td>
            <td><span class="category-badge badge-${exp.category.toLowerCase()}">${exp.category}</span></td>
            <td>₹${exp.amount.toFixed(2)}</td>
            <td>₹${exp.tax.toFixed(2)}</td>
            <td>
                <i class="fa-regular fa-trash-can btn-delete-icon" onclick="deleteExpense(${exp.id}, '${exp.category}')"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteExpense(id, category) {
    state.expenses = state.expenses.filter(exp => exp.id !== id);
    loadDashboardStats();
    renderExpensesTable();
    updateCharts();
    checkBudgetAlerts(category);
}

function openAddManualModal() {
    document.getElementById("manual-expense-modal").classList.remove("hidden");
    document.getElementById("manual-date").value = new Date().toISOString().split('T')[0];
}

function saveManualExpense() {
    const merchant = document.getElementById("manual-merchant").value;
    const amount = parseFloat(document.getElementById("manual-amount").value);
    const tax = parseFloat(document.getElementById("manual-tax").value) || 0;
    const date = document.getElementById("manual-date").value;
    const category = document.getElementById("manual-category").value;

    if (!merchant || isNaN(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const newExpense = {
        id: Date.now(),
        merchant: merchant,
        amount: amount,
        tax: tax,
        date: date,
        category: category
    };

    state.expenses.unshift(newExpense);
    
    closeModal("manual-expense-modal");
    document.getElementById("manual-merchant").value = '';
    document.getElementById("manual-amount").value = '';
    document.getElementById("manual-tax").value = '';

    loadDashboardStats();
    renderExpensesTable();
    updateCharts();
    checkBudgetAlerts(category);
}

function renderBudgets() {
    const container = document.getElementById("budgets-list-container");
    container.innerHTML = '';

    for (let category in state.budgets) {
        const limit = state.budgets[category];
        const spent = state.expenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        
        const percent = Math.min((spent / limit) * 100, 150);
        
        let colorClass = 'success';
        if (percent >= 100) colorClass = 'danger';
        else if (percent >= 85) colorClass = 'warning';

        const row = document.createElement("div");
        row.className = "budget-row";
        row.innerHTML = `
            <div class="budget-info">
                <span class="cat-name"><span class="category-badge badge-${category.toLowerCase()}">${category}</span></span>
                <span class="limit-spent">Spent: <strong>₹${spent.toFixed(0)}</strong> / Limit: ₹${limit} (${(spent/limit*100).toFixed(0)}%)</span>
            </div>
            <div class="progress-bar-large">
                <div class="fill ${colorClass}" style="width: ${Math.min(percent, 100)}%"></div>
            </div>
        `;
        container.appendChild(row);
    }
}

function saveBudgetLimit() {
    const cat = document.getElementById("budget-category").value;
    const limit = parseFloat(document.getElementById("budget-limit-val").value);

    if (isNaN(limit) || limit <= 0) {
        alert("Please enter a valid limit.");
        return;
    }

    state.budgets[cat] = limit;
    document.getElementById("budget-limit-val").value = '';

    renderBudgets();
    loadDashboardStats();
    checkBudgetAlerts(cat);
}

function openAddReminderModal() {
    document.getElementById("subscription-modal").classList.remove("hidden");
    document.getElementById("sub-due-date").value = new Date().toISOString().split('T')[0];
}

function openAddFriendModal() {
    document.getElementById("friend-modal").classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

// ==========================================================================
// AUTHENTICATION LOGIC & SCREEN OVERLAY
// ==========================================================================
let isLoggedIn = localStorage.getItem("vesta_logged_in") === "true";

function setupAuth() {
    // Check initial state
    if (isLoggedIn) {
        document.getElementById("auth-screen").style.display = "none";
        document.querySelector(".app-container").style.display = "flex";
        // Load details from storage
        const savedName = localStorage.getItem("vesta_user_name") || "John Doe";
        const savedEmail = localStorage.getItem("vesta_user_email") || "user@vesta.ai";
        updateUserProfile(savedName, savedEmail);
    } else {
        document.getElementById("auth-screen").style.display = "flex";
        document.querySelector(".app-container").style.display = "none";
    }

    // Toggle forms
    document.getElementById("to-register-link").addEventListener("click", () => {
        document.getElementById("login-card").style.display = "none";
        document.getElementById("register-card").style.display = "flex";
    });

    document.getElementById("to-login-link").addEventListener("click", () => {
        document.getElementById("register-card").style.display = "none";
        document.getElementById("login-card").style.display = "flex";
    });

    document.getElementById("forgot-password-link").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("login-card").style.display = "none";
        document.getElementById("forgot-card").style.display = "flex";
    });

    document.getElementById("back-to-login-link").addEventListener("click", () => {
        document.getElementById("forgot-card").style.display = "none";
        document.getElementById("login-card").style.display = "flex";
    });

    // Form Submit Handlers
    document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        if (email && password) {
            const name = email.split('@')[0];
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            loginUser(formattedName, email);
            triggerNotification('soft', `Welcome back, ${formattedName}!`, 'Auth');
        }
    });

    document.getElementById("register-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        
        triggerNotification('soft', "Account created! Please sign in.", 'Auth');
        document.getElementById("register-card").style.display = "none";
        document.getElementById("login-card").style.display = "flex";
    });

    document.getElementById("forgot-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("forgot-email").value;
        triggerNotification('soft', `Password reset recovery link sent to ${email}`, 'Auth');
        document.getElementById("forgot-card").style.display = "none";
        document.getElementById("login-card").style.display = "flex";
    });

    // Google Sign in simulation
    document.getElementById("google-login-btn").addEventListener("click", () => {
        loginUser("Chakshu Karemore", "chakshu@gmail.com");
        triggerNotification('soft', "Successfully signed in with Google Account!", 'Auth');
    });

    // Logout Action
    document.getElementById("logout-btn").addEventListener("click", () => {
        logoutUser();
        triggerNotification('soft', "Logged out successfully.", 'Auth');
    });
}

function loginUser(name, email) {
    isLoggedIn = true;
    localStorage.setItem("vesta_logged_in", "true");
    localStorage.setItem("vesta_user_name", name);
    localStorage.setItem("vesta_user_email", email);
    
    updateUserProfile(name, email);
    
    document.getElementById("auth-screen").style.display = "none";
    document.querySelector(".app-container").style.display = "flex";
}

function logoutUser() {
    isLoggedIn = false;
    localStorage.removeItem("vesta_logged_in");
    localStorage.removeItem("vesta_user_name");
    localStorage.removeItem("vesta_user_email");
    
    document.getElementById("auth-screen").style.display = "flex";
    document.querySelector(".app-container").style.display = "none";
}

function updateUserProfile(name, email) {
    document.getElementById("profile-name").textContent = name;
    document.getElementById("profile-desc").textContent = email;
    
    // Initials calculation
    const parts = name.split(" ");
    let initials = parts[0]?.charAt(0) || "";
    if (parts[1]) initials += parts[1].charAt(0);
    document.getElementById("profile-initials").textContent = initials.toUpperCase() || "JD";
}
