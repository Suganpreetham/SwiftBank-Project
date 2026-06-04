package com.swiftbank.account.dto;

import com.swiftbank.account.model.Account;
import lombok.*;
import java.math.BigDecimal;

public class AccountDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAccountRequest {
        private Account.AccountType type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountResponse {
        private String id;
        private String accountNumber;
        private String userId;
        private Account.AccountType type;
        private BigDecimal balance;
        private Account.AccountStatus status;
    }
}