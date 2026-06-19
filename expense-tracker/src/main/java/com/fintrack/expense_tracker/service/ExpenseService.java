package com.fintrack.expense_tracker.service;

import com.fintrack.expense_tracker.dto.ExtractedBillDTO;
import com.fintrack.expense_tracker.dto.ExpenseResponseDTO;
import com.fintrack.expense_tracker.dto.AnalyticsResponseDTO;
import com.fintrack.expense_tracker.model.Budget;
import com.fintrack.expense_tracker.model.Expense;
import com.fintrack.expense_tracker.repository.BudgetRepository;
import com.fintrack.expense_tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public ExtractedBillDTO getMockBillData() {
        ExtractedBillDTO mockBill = new ExtractedBillDTO();
        mockBill.setMerchant("Dominos Pizza");
        mockBill.setDate("2026-06-05");
        mockBill.setAmount(600.0);  
        mockBill.setTax(30.0);      
        mockBill.setCategory("Food"); 
        return mockBill;
    }

    public ExpenseResponseDTO processExpenseAlerts(Long userId, ExtractedBillDTO billDTO) {
        Budget budget = budgetRepository.findByUserIdAndCategory(userId, billDTO.getCategory())
                .orElse(new Budget(userId, billDTO.getCategory(), 5000.0, 4200.0));

        double projectedSpent = budget.getCurrentSpent() + billDTO.getAmount();
        boolean isOverBudget = false;
        String alertMessage = "Success: Expense processed within budget.";

        if (projectedSpent > budget.getMonthlyLimit()) {
            isOverBudget = true;
            alertMessage = "⚠️ Budget Exceeded! You are crossing your limit of ₹" + budget.getMonthlyLimit() + " for " + budget.getCategory() + ".";
        } else if (projectedSpent >= (budget.getMonthlyLimit() * 0.85)) {
            alertMessage = "⚠️ Warning: You have reached 85% of your budget limit for " + budget.getCategory() + ".";
        }

        // Save the expense record in database
        Expense expense = new Expense();
        expense.setMerchant(billDTO.getMerchant());
        try {
            expense.setDate(LocalDate.parse(billDTO.getDate()));
        } catch (Exception e) {
            expense.setDate(LocalDate.now());
        }
        expense.setAmount(billDTO.getAmount());
        expense.setTax(billDTO.getTax());
        expense.setCategory(billDTO.getCategory());
        expense.setUserId(userId);
        Expense savedExpense = expenseRepository.save(expense);

        budget.setCurrentSpent(projectedSpent);
        budgetRepository.save(budget);

        return new ExpenseResponseDTO(isOverBudget, alertMessage, projectedSpent, savedExpense);
    }

    public List<Expense> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId);
    }

    public AnalyticsResponseDTO getMonthOverMonthAnalytics(Long userId) {
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfCurrentMonth = today.withDayOfMonth(1);
        LocalDate startOfPrevMonth = startOfCurrentMonth.minusMonths(1);
        LocalDate endOfPrevMonth = startOfCurrentMonth.minusDays(1);

        double currentMonthTotal = 0.0;
        double prevMonthTotal = 0.0;

        java.util.Map<String, Double> currentCategoryTotals = new java.util.HashMap<>();
        java.util.Map<String, Double> prevCategoryTotals = new java.util.HashMap<>();

        for (Expense exp : expenses) {
            LocalDate expDate = exp.getDate();
            if (expDate != null) {
                if (!expDate.isBefore(startOfCurrentMonth) && !expDate.isAfter(today)) {
                    currentMonthTotal += exp.getAmount();
                    currentCategoryTotals.put(exp.getCategory(), 
                        currentCategoryTotals.getOrDefault(exp.getCategory(), 0.0) + exp.getAmount());
                } else if (!expDate.isBefore(startOfPrevMonth) && !expDate.isAfter(endOfPrevMonth)) {
                    prevMonthTotal += exp.getAmount();
                    prevCategoryTotals.put(exp.getCategory(), 
                        prevCategoryTotals.getOrDefault(exp.getCategory(), 0.0) + exp.getAmount());
                }
            }
        }

        double percentageChange = 0.0;
        String trend = "NO_CHANGE";
        if (prevMonthTotal > 0.0) {
            percentageChange = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
            if (percentageChange > 0.0) {
                trend = "INCREASED";
            } else if (percentageChange < 0.0) {
                trend = "DECREASED";
            }
        } else if (currentMonthTotal > 0.0) {
            percentageChange = 100.0;
            trend = "INCREASED";
        }

        // Find category with highest share in current month
        String highestCategoryChange = "None";
        double maxCategorySpent = -1.0;
        for (java.util.Map.Entry<String, Double> entry : currentCategoryTotals.entrySet()) {
            if (entry.getValue() > maxCategorySpent) {
                maxCategorySpent = entry.getValue();
                highestCategoryChange = entry.getKey();
            }
        }

        return new AnalyticsResponseDTO(currentMonthTotal, prevMonthTotal, 
                Math.round(percentageChange * 100.0) / 100.0, highestCategoryChange, trend);
    }
}