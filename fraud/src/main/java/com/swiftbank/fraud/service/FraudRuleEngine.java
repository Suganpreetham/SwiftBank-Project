package com.swiftbank.fraud.service;

import com.swiftbank.fraud.kafka.TransactionEvent;
import com.swiftbank.fraud.model.FraudAlert;
import com.swiftbank.fraud.repository.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudRuleEngine {

    private final FraudAlertRepository fraudAlertRepository;

    private static final BigDecimal LARGE_AMOUNT_THRESHOLD = new BigDecimal("10000");
    private static final BigDecimal ROUND_AMOUNT_THRESHOLD = new BigDecimal("5000");
    private static final int VELOCITY_LIMIT = 3;
    private static final int VELOCITY_WINDOW_SECONDS = 60;

    public void evaluate(TransactionEvent event) {
        List<FraudAlert> alerts = new ArrayList<>();

        // Rule 1 — Large amount
        if (event.getAmount().compareTo(LARGE_AMOUNT_THRESHOLD) > 0) {
            log.warn("FRAUD RULE 1 triggered — Large amount: {} for account {}",
                    event.getAmount(), event.getFromAccountId());
            alerts.add(buildAlert(event, FraudAlert.AlertReason.LARGE_AMOUNT));
        }

        // Rule 2 — Velocity check (3+ transactions in 60 seconds)
        LocalDateTime windowStart = LocalDateTime.now()
                .minusSeconds(VELOCITY_WINDOW_SECONDS);
        int recentCount = fraudAlertRepository
                .countByAccountIdAndCreatedAtAfter(event.getFromAccountId(), windowStart);
        if (recentCount >= VELOCITY_LIMIT) {
            log.warn("FRAUD RULE 2 triggered — Velocity breach for account {}",
                    event.getFromAccountId());
            alerts.add(buildAlert(event, FraudAlert.AlertReason.VELOCITY_BREACH));
        }

        // Rule 3 — Suspiciously round large amount
        if (event.getAmount().compareTo(ROUND_AMOUNT_THRESHOLD) > 0
                && event.getAmount().remainder(new BigDecimal("1000"))
                .compareTo(BigDecimal.ZERO) == 0) {
            log.warn("FRAUD RULE 3 triggered — Round amount: {} for account {}",
                    event.getAmount(), event.getFromAccountId());
            alerts.add(buildAlert(event, FraudAlert.AlertReason.ROUND_AMOUNT));
        }

        if (!alerts.isEmpty()) {
            fraudAlertRepository.saveAll(alerts);
            log.info("Saved {} fraud alert(s) for transaction {}",
                    alerts.size(), event.getTransactionId());
        } else {
            log.info("Transaction {} passed all fraud checks", event.getTransactionId());
        }
    }

    private FraudAlert buildAlert(TransactionEvent event, FraudAlert.AlertReason reason) {
        return FraudAlert.builder()
                .transactionId(event.getTransactionId())
                .accountId(event.getFromAccountId())
                .amount(event.getAmount())
                .reason(reason)
                .build();
    }
}