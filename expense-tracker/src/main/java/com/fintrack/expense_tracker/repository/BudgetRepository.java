package com.fintrack.expense_tracker.repository;

import com.fintrack.expense_tracker.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    // Custom query: userId aur category dono se data nikalne ke liye
    Optional<Budget> findByUserIdAndCategory(Long userId, String category);

    // List of budgets for a user
    List<Budget> findByUserId(Long userId);
}
