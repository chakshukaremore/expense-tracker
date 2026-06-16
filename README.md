# Vesta AI - Smart Expense Tracker with Gemini OCR & Alert Engine

Vesta AI is a modern, full-stack, enterprise-ready Smart Expense Tracker. It features an automated AI receipt scanner powered by **Google Gemini 1.5 Flash**, a real-time **Alert & Budget Engine**, **Subscription Reminders**, **Split Ledger Billing**, and professional **PDF/CSV Report Exports**.

Designed with **glassmorphism aesthetics** and neon dark-mode accents, the application runs both as a fully integrated full-stack React-Spring Boot system and a zero-dependency standalone interactive browser demo.

---

## 🚀 Key Features

1. **Multimodal AI Receipt Scanner**: Upload any receipt image. The backend sends it to the Google Gemini 1.5 Flash API to extract the merchant name, date, total amount, taxes, and categorise the expense automatically.
2. **Real-Time Dynamic Alert Engine**: Catches category budgets dynamically.
   * `Usage >= 85%`: Triggers a soft warning alert banner.
   * `Usage >= 100%`: Triggers a hard limit budget exceeded pulse warning.
3. **Subscription & Recurring Bill Reminders**: Tracks broadband, streaming, and utilities. Automatically flags and pops up notifications for bills due in $\le 2$ days, and updates billing logs when marked paid.
4. **Friends Split Dues (Ledger Settlements)**: Multi-person billing log. Keeps a running ledger balance between friends (e.g. "Amit owes you ₹300", "You owe Priya ₹120") and supports settling up transactions.
5. **PDF & CSV Financial Reports**: One-click download of CSV logs and printable PDF summaries (generated using OpenPDF & Apache POI on the backend).

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vanilla Glassmorphism CSS, Chart.js, Axios
* **Backend**: Java 17, Spring Boot, Spring Data JPA, H2 Memory Database, Maven
* **AI Model**: Google Gemini 1.5 Flash API
* **Reports Compiler**: Apache POI (Excel sheets builder), OpenPDF (PDF document builder)
* **Testing / Simulation**: HTML5/Vanilla JS Interactive Browser Sandbox

---

## 📂 Repository Structure

```text
expense-tracker/
├── demo/                   # Standalone browser prototype (zero-dependencies)
│   ├── index.html          # HTML5 layout
│   ├── style.css           # Glassmorphism dark mode styles
│   └── app.js              # State management & simulated OCR pipeline
├── frontend/               # React.js application
│   ├── package.json        # Dependencies config
│   ├── public/             # HTML shell
│   └── src/
│       ├── components/     # Dashboard, Scanner, Budgets, Reminders, SplitBills
│       ├── App.js          # Core routing & API integration
│       ├── index.css       # Global design variables & animations
│       └── index.js        # React Entrypoint
└── expense-tracker/        # Spring Boot Java application
    ├── pom.xml             # Maven dependencies
    ├── src/main/java/com/fintrack/expense_tracker/
    │   ├── controller/      # REST API Controllers (Expense, Budget, Reminders, Reports)
    │   ├── model/           # JPA Entities (Expense, Budget, RecurringBill, Group split)
    │   ├── repository/      # Spring Data JPA interfaces
    │   ├── dto/             # ExtractedBillDTO, ExpenseResponseDTO
    │   └── service/         # Business logic services & GeminiService
    └── src/main/resources/
        └── application.properties   # H2 configuration & Gemini keys
```

---

## 💻 Setup & Installation Guide

### Phase 1: Run Standalone Demo (No setup needed)
1. Go to the `demo/` folder.
2. Double-click `index.html` to launch the client directly in any browser.

### Phase 2: Start Spring Boot Backend
1. Make sure you have **JDK 17+** and **Maven** installed.
2. Open terminal in the `expense-tracker` backend directory.
3. Configure your Google Gemini API key:
   ```cmd
   # On Windows PowerShell:
   $env:GEMINI_API_KEY="YOUR_GEMINI_KEY"
   
   # On Command Prompt:
   set GEMINI_API_KEY=YOUR_GEMINI_KEY
   ```
4. Run the application:
   ```bash
   mvn clean spring-boot:run
   ```
5. The backend server will start running at `http://localhost:8080`.
6. Access the In-Memory H2 Database Console at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:fintrackdb`).

### Phase 3: Start React Frontend
1. Ensure **Node.js** and **npm** are installed.
2. Navigate to the `frontend/` directory in your terminal.
3. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```
4. The client will load up at `http://localhost:3000` and automatically connect with the Spring Boot REST services.

---

## 🧾 REST API Reference

* **Receipt Scanning**: `POST /api/expenses/upload` (accepts Multipart receipt files and extracts JSON).
* **Mock Testing Endpoint**: `POST /api/expenses/mock-upload` (adds simulated Domino's receipt).
* **Category Budgets**: `GET /api/budgets?userId=1`, `POST /api/budgets` (updates spending targets).
* **Subscription Management**: `GET /api/subscriptions?userId=1`, `POST /api/subscriptions/:id/pay` (extends due date by 1 month).
* **Split Ledger Billing**: `POST /api/groups/expenses` (logs splits), `GET /api/groups/balances` (computes friend-to-friend ledger).
* **Excel Report Download**: `GET /api/reports/excel?userId=1` (downloads spreadsheet).
* **PDF Report Download**: `GET /api/reports/pdf?userId=1` (downloads compilation sheets).
