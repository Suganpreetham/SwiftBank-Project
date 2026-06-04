package com.swiftbank.fraud.repository;

import com.swiftbank.fraud.model.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, String> {
    List<FraudAlert> findByAccountId(String accountId);
    int countByAccountIdAndCreatedAtAfter(String accountId, LocalDateTime after);
}