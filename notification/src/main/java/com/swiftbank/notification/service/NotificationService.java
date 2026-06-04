package com.swiftbank.notification.service;

import com.swiftbank.notification.kafka.TransactionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationService {

    public void sendTransactionNotification(TransactionEvent event) {
        switch (event.getType()) {
            case "DEPOSIT" -> log.info("""
                    📩 NOTIFICATION [DEPOSIT]
                    Account  : {}
                    Amount   : {}
                    Status   : {}
                    Time     : {}
                    """,
                    event.getFromAccountId(),
                    event.getAmount(),
                    event.getStatus(),
                    event.getCreatedAt());

            case "TRANSFER" -> log.info("""
                    📩 NOTIFICATION [TRANSFER]
                    From     : {}
                    To       : {}
                    Amount   : {}
                    Status   : {}
                    Time     : {}
                    """,
                    event.getFromAccountId(),
                    event.getToAccountId(),
                    event.getAmount(),
                    event.getStatus(),
                    event.getCreatedAt());

            default -> log.info("📩 NOTIFICATION: Transaction {} - {} - {}",
                    event.getTransactionId(),
                    event.getType(),
                    event.getStatus());
        }
    }
}