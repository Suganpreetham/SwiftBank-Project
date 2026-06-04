package com.swiftbank.transaction.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionEventProducer {

    private static final String TOPIC = "transaction.completed";
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    public void publish(TransactionEvent event) {
        kafkaTemplate.send(TOPIC, event.getTransactionId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish event: {}", ex.getMessage());
                    } else {
                        log.info("Event published to topic {} for transaction {}",
                                TOPIC, event.getTransactionId());
                    }
                });
    }
}