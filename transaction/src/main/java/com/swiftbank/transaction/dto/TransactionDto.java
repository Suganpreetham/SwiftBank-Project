package com.swiftbank.transaction.dto;

import com.swiftbank.transaction.model.Transaction;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferRequest {
        private String fromAccountId;
        private String toAccountId;
        private BigDecimal amount;
        private String description;
        private String idempotencyKey;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepositRequest {
        private String accountId;
        private BigDecimal amount;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private String id;
        private String fromAccountId;
        private String toAccountId;
        private BigDecimal amount;
        private Transaction.TransactionType type;
        private Transaction.TransactionStatus status;
        private String description;
        private LocalDateTime createdAt;
    }
}