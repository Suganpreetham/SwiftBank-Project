package com.swiftbank.transaction.service;

import com.swiftbank.transaction.dto.TransactionDto.*;
import com.swiftbank.transaction.kafka.TransactionEvent;
import com.swiftbank.transaction.kafka.TransactionEventProducer;
import com.swiftbank.transaction.model.Transaction;
import com.swiftbank.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionEventProducer eventProducer;
    private final RestTemplate restTemplate;

    private static final String ACCOUNT_SERVICE = "http://swiftbank-account:8082/api/accounts";

    // ── IDEMPOTENCY CHECK ──────────────────────────────────────────
    // If Kafka retries or client resends — we don't process twice
    private Transaction checkIdempotency(String key) {
        return transactionRepository.findByIdempotencyKey(key).orElse(null);
    }

    // ── TRANSFER ───────────────────────────────────────────────────
    @Transactional
    public TransactionResponse transfer(TransferRequest request) {

        // Idempotency — return existing if already processed
        Transaction existing = checkIdempotency(request.getIdempotencyKey());
        if (existing != null) {
            log.info("Duplicate request detected for key: {}", request.getIdempotencyKey());
            return toResponse(existing);
        }

        // Fetch balances from account service
        BigDecimal fromBalance = getBalance(request.getFromAccountId());

        // Insufficient funds check
        if (fromBalance.compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        // Debit sender
        updateBalance(request.getFromAccountId(), fromBalance.subtract(request.getAmount()));

        // Credit receiver
        BigDecimal toBalance = getBalance(request.getToAccountId());
        updateBalance(request.getToAccountId(), toBalance.add(request.getAmount()));

        // Save transaction record
        Transaction transaction = Transaction.builder()
                .idempotencyKey(request.getIdempotencyKey() != null
                        ? request.getIdempotencyKey()
                        : UUID.randomUUID().toString())
                .fromAccountId(request.getFromAccountId())
                .toAccountId(request.getToAccountId())
                .amount(request.getAmount())
                .type(Transaction.TransactionType.TRANSFER)
                .status(Transaction.TransactionStatus.COMPLETED)
                .description(request.getDescription())
                .build();

        transactionRepository.save(transaction);

        // Publish Kafka event — fraud + notification consume this
        eventProducer.publish(TransactionEvent.builder()
                .transactionId(transaction.getId())
                .fromAccountId(transaction.getFromAccountId())
                .toAccountId(transaction.getToAccountId())
                .amount(transaction.getAmount())
                .type(transaction.getType().name())
                .status(transaction.getStatus().name())
                .createdAt(transaction.getCreatedAt())
                .build());

        return toResponse(transaction);
    }

    // ── DEPOSIT ────────────────────────────────────────────────────
    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        BigDecimal current = getBalance(request.getAccountId());
        updateBalance(request.getAccountId(), current.add(request.getAmount()));

        Transaction transaction = Transaction.builder()
                .idempotencyKey(UUID.randomUUID().toString())
                .fromAccountId(request.getAccountId())
                .amount(request.getAmount())
                .type(Transaction.TransactionType.DEPOSIT)
                .status(Transaction.TransactionStatus.COMPLETED)
                .description(request.getDescription())
                .build();

        transactionRepository.save(transaction);

        eventProducer.publish(TransactionEvent.builder()
                .transactionId(transaction.getId())
                .fromAccountId(transaction.getFromAccountId())
                .amount(transaction.getAmount())
                .type(transaction.getType().name())
                .status(transaction.getStatus().name())
                .createdAt(transaction.getCreatedAt())
                .build());

        return toResponse(transaction);
    }

    // ── HISTORY ────────────────────────────────────────────────────
    public List<TransactionResponse> getHistory(String accountId) {
        List<Transaction> sent = transactionRepository
                .findByFromAccountIdOrderByCreatedAtDesc(accountId);
        List<Transaction> received = transactionRepository
                .findByToAccountIdOrderByCreatedAtDesc(accountId);
        sent.addAll(received);
        return sent.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── HELPERS ────────────────────────────────────────────────────
    private BigDecimal getBalance(String accountId) {
        try {
            return restTemplate.getForObject(
                    ACCOUNT_SERVICE + "/" + accountId + "/balance",
                    BigDecimal.class);
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch balance for account: " + accountId);
        }
    }

    private void updateBalance(String accountId, BigDecimal newBalance) {
        try {
            restTemplate.put(
                    ACCOUNT_SERVICE + "/" + accountId + "/balance",
                    newBalance);
        } catch (Exception e) {
            throw new RuntimeException("Could not update balance for account: " + accountId);
        }
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .fromAccountId(t.getFromAccountId())
                .toAccountId(t.getToAccountId())
                .amount(t.getAmount())
                .type(t.getType())
                .status(t.getStatus())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build();
    }
}