package com.vireocode.vireo.offline;

import java.util.Objects;
import java.util.function.Supplier;

import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Opens the short, independent transactions used to claim and finalize a replay.
 */
final class OfflineSyncTransactionOperations {

    private final TransactionTemplate transactionTemplate;

    OfflineSyncTransactionOperations(PlatformTransactionManager transactionManager) {
        this.transactionTemplate = new TransactionTemplate(Objects.requireNonNull(transactionManager,
                "transactionManager"));
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    <T> T requiresNew(Supplier<T> work) {
        Supplier<T> requiredWork = Objects.requireNonNull(work, "work");
        return transactionTemplate.execute(status -> requiredWork.get());
    }
}
