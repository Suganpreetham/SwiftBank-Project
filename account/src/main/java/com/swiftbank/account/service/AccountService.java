package com.swiftbank.account.service;

import com.swiftbank.account.dto.AccountDto.*;
import com.swiftbank.account.model.Account;
import com.swiftbank.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountResponse createAccount(String userId, CreateAccountRequest request) {
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .userId(userId)
                .type(request.getType())
                .balance(BigDecimal.ZERO)
                .build();
        accountRepository.save(account);
        return toResponse(account);
    }

    public List<AccountResponse> getUserAccounts(String userId) {
        return accountRepository.findByUserId(userId)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getBalance(String accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"))
                .getBalance();
    }

    @CacheEvict(value = "balances", key = "#accountId")
    public void evictBalanceCache(String accountId) {
        // called by transaction service after every transfer
    }

    private String generateAccountNumber() {
        String number;
        do {
            number = "SB" + (1000000000L + new Random().nextLong(9000000000L));
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }

    private AccountResponse toResponse(Account a) {
        return AccountResponse.builder()
                .id(a.getId())
                .accountNumber(a.getAccountNumber())
                .userId(a.getUserId())
                .type(a.getType())
                .balance(a.getBalance())
                .status(a.getStatus())
                .build();
    }

    @CacheEvict(value = "balances", key = "#accountId")
    public void updateBalance(String accountId, BigDecimal newBalance) {
        int updated = accountRepository.updateBalance(accountId, newBalance);
        if (updated == 0) throw new RuntimeException("Account not found");
    }
}