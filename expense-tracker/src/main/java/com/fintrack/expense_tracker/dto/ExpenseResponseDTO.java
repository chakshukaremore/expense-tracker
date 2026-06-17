

package com.fintrack.expense_tracker.dto;

import com.fintrack.expense_tracker.model.Expense;

public class ExpenseResponseDTO {
    private boolean isOverBudget;
    private String alertMessage;
    private double projectedSpent;
    private Expense expense;

    public ExpenseResponseDTO() {}

    public ExpenseResponseDTO(boolean isOverBudget, String alertMessage, double projectedSpent) {
        this.isOverBudget = isOverBudget;
        this.alertMessage = alertMessage;
        this.projectedSpent = projectedSpent;
    }

    public ExpenseResponseDTO(boolean isOverBudget, String alertMessage, double projectedSpent, Expense expense) {
        this.isOverBudget = isOverBudget;
        this.alertMessage = alertMessage;
        this.projectedSpent = projectedSpent;
        this.expense = expense;
    }

    public boolean isOverBudget() {
        return isOverBudget;
    }

    public void setOverBudget(boolean overBudget) {
        isOverBudget = overBudget;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public double getProjectedSpent() {
        return projectedSpent;
    }

    public void setProjectedSpent(double projectedSpent) {
        this.projectedSpent = projectedSpent;
    }

    public Expense getExpense() {
        return expense;
    }

    public void setExpense(Expense expense) {
        this.expense = expense;
    }
}
