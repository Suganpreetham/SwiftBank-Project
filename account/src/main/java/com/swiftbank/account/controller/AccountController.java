package com.swiftbank.account.controller;

import com.swiftbank.account.dto.AccountDto.*;
import com.swiftbank.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(Authentication auth,
                                                  @RequestBody CreateAccountRequest request) {
        return ResponseEntity.ok(accountService.createAccount(auth.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getMyAccounts(Authentication auth) {
        return ResponseEntity.ok(accountService.getUserAccounts(auth.getName()));
    }

    @GetMapping("/{accountId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable String accountId) {
        return ResponseEntity.ok(accountService.getBalance(accountId));
    }

    @PutMapping("/{accountId}/balance")
    public ResponseEntity<Void> updateBalance(@PathVariable String accountId,
                                              @RequestBody BigDecimal newBalance) {
        accountService.updateBalance(accountId, newBalance);
        return ResponseEntity.ok().build();
    }
}