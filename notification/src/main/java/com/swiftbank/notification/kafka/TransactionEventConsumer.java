package com.swiftbank.notification.kafka;

import com.swiftbank.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "transaction.completed",
            groupId = "notification-group"
    )
    public void consume(TransactionEvent event) {
        log.info("Notification service received event: {}",
                event.getTransactionId());
        notificationService.sendTransactionNotification(event);
    }
}