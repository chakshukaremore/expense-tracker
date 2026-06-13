package com.fintrack.expense_tracker.service;

import com.fintrack.expense_tracker.model.Budget;
import com.fintrack.expense_tracker.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Budget getBudgetByCategory(Long userId, String category) {
        return budgetRepository.findByUserIdAndCategory(userId, category)
                .orElse(new Budget(userId, category, 5000.0, 0.0));
    }

    public Budget saveOrUpdateBudget(Budget budget) {
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategory(
                budget.getUserId(), budget.getCategory());

        if (existingBudget.isPresent()) {
            Budget currentBudget = existingBudget.get();
            currentBudget.setMonthlyLimit(budget.getMonthlyLimit());
            // Keep current spent or update it if provided
            if (budget.getCurrentSpent() > 0) {
                currentBudget.setCurrentSpent(budget.getCurrentSpent());
            }
            return budgetRepository.save(currentBudget);
        } else {
            return budgetRepository.save(budget);
        }
    }
}
