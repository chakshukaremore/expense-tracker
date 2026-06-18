package com.fintrack.expense_tracker.controller;

import com.fintrack.expense_tracker.dto.ExtractedBillDTO;
import com.fintrack.expense_tracker.dto.ExpenseResponseDTO;
import com.fintrack.expense_tracker.model.Expense;
import com.fintrack.expense_tracker.service.ExpenseService;
import com.fintrack.expense_tracker.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // React communication support
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private GeminiService geminiService;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@RequestParam Long userId) {
        return ResponseEntity.ok(expenseService.getExpensesByUserId(userId));
    }

    // 📷 Endpoint 1: Real Receipt Scanner (Gemini API Integration)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExpenseResponseDTO> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long userId) {
        try {
            // 1. Binary image bytes get kiye
            byte[] imageBytes = file.getBytes();
            String contentType = file.getContentType();
            
            // 2. Gemini API call kiya
            ExtractedBillDTO extractedBill = geminiService.analyzeReceipt(imageBytes, contentType);
            
            // 3. Alert Engine Logic call kiya
            ExpenseResponseDTO response = expenseService.processExpenseAlerts(userId, extractedBill);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ExpenseResponseDTO(false, "Gemini AI Processing Failed: " + e.getMessage(), 0.0));
        }
    }

    // 📅 Endpoint 2: Week 3 Testing Endpoint (Mock Data)
    @PostMapping("/mock-upload")
    public ResponseEntity<ExpenseResponseDTO> uploadMockExpense(@RequestParam Long userId) {
        // 1. Mock data fetch kiya
        ExtractedBillDTO mockBill = expenseService.getMockBillData();
        
        // 2. Alert Engine Logic call kiya
        ExpenseResponseDTO response = expenseService.processExpenseAlerts(userId, mockBill);
        
        // 3. Response return kiya
        return ResponseEntity.ok(response);
    }
}