package com.fintrack.expense_tracker.controller;

import com.fintrack.expense_tracker.model.Budget;
import com.fintrack.expense_tracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(@RequestParam Long userId) {
        return ResponseEntity.ok(budgetService.getBudgetsByUserId(userId));
    }

    @GetMapping("/category")
    public ResponseEntity<Budget> getBudgetByCategory(
            @RequestParam Long userId,
            @RequestParam String category) {
        return ResponseEntity.ok(budgetService.getBudgetByCategory(userId, category));
    }

    @PostMapping
    public ResponseEntity<Budget> createOrUpdateBudget(@RequestBody Budget budget) {
        Budget savedBudget = budgetService.saveOrUpdateBudget(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBudget);
    }
}
