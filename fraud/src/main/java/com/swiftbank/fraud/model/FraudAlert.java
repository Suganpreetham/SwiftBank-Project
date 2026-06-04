package com.swiftbank.fraud.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String transactionId;
    private String accountId;
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private AlertReason reason;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = AlertStatus.OPEN;
    }

    public enum AlertReason {
        LARGE_AMOUNT,       // transaction > 10000
        VELOCITY_BREACH,    // 3+ transactions in 60 seconds
        ROUND_AMOUNT        // suspiciously round number > 5000
    }

    public enum AlertStatus {
        OPEN, REVIEWED, DISMISSED
    }
}