package com.swiftbank.fraud.kafka;

import com.swiftbank.fraud.service.FraudRuleEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionEventConsumer {

    private final FraudRuleEngine fraudRuleEngine;

    @KafkaListener(
            topics = "transaction.completed",
            groupId = "fraud-group"
    )
    public void consume(TransactionEvent event) {
        log.info("Fraud service received event for transaction: {}",
                event.getTransactionId());
        fraudRuleEngine.evaluate(event);
    }
}