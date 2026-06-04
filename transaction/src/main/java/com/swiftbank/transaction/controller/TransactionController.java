package com.swiftbank.transaction.controller;

import com.swiftbank.transaction.dto.TransactionDto.*;
import com.swiftbank.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(transactionService.transfer(request));
    }

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(@RequestBody DepositRequest request) {
        return ResponseEntity.ok(transactionService.deposit(request));
    }

    @GetMapping("/history/{accountId}")
    public ResponseEntity<List<TransactionResponse>> history(@PathVariable String accountId) {
        return ResponseEntity.ok(transactionService.getHistory(accountId));
    }
}