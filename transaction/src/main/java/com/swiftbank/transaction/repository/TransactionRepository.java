package com.swiftbank.transaction.repository;

import com.swiftbank.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);
    List<Transaction> findByFromAccountIdOrderByCreatedAtDesc(String accountId);
    List<Transaction> findByToAccountIdOrderByCreatedAtDesc(String accountId);
}