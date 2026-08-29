package com.vireocode.docs.offline;

import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;

import com.vireocode.vireo.offline.OfflineActor;
import com.vireocode.vireo.offline.OfflineActorResolver;
import com.vireocode.vireo.offline.OfflineSyncBodyNormalizer;
import com.vireocode.vireo.offline.OfflineSyncCommandDto;
import com.vireocode.vireo.offline.OfflineSyncCommandResultDto;
import com.vireocode.vireo.offline.OfflineSyncReplayHandler;
import com.vireocode.vireo.offline.OfflineSyncResultReason;

import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods = false)
public class OfflineReplayConfigurationExample {

    @Bean
    OfflineActorResolver applicationOfflineActorResolver(CurrentUser currentUser) {
        return () -> currentUser.id()
                .map(id -> new OfflineActor(id, currentUser.username(), currentUser.canInspectAllOfflineCommands()));
    }

    @Bean
    @Order(10)
    OfflineSyncReplayHandler orderQuantityReplayHandler(ObjectMapper objectMapper, OrderCommands orderCommands) {
        return new OrderQuantityReplayHandler(objectMapper, orderCommands);
    }

    record ChangeQuantity(int quantity) {
    }

    static final class OrderQuantityReplayHandler implements OfflineSyncReplayHandler {

        private final ObjectMapper objectMapper;
        private final OrderCommands orderCommands;

        OrderQuantityReplayHandler(ObjectMapper objectMapper, OrderCommands orderCommands) {
            this.objectMapper = objectMapper;
            this.orderCommands = orderCommands;
        }

        @Override
        public boolean supports(OfflineSyncCommandDto command, HttpMethod method) {
            return method == HttpMethod.PATCH && command.url().matches("/api/orders/[0-9a-fA-F-]+/quantity");
        }

        @Override
        public OfflineSyncCommandResultDto process(OfflineSyncCommandDto command) {
            try {
                String id = command.url().split("/")[3];
                ChangeQuantity input = OfflineSyncBodyNormalizer.treeToValue(
                        command.body(), objectMapper, ChangeQuantity.class);
                orderCommands.changeQuantity(UUID.fromString(id), input.quantity());
                return new OfflineSyncCommandResultDto(command.commandId(), true, 204, null);
            } catch (IllegalArgumentException exception) {
                return new OfflineSyncCommandResultDto(
                        command.commandId(), false, 422, "The queued order command is invalid.",
                        OfflineSyncResultReason.REJECTED);
            } catch (Exception exception) {
                return new OfflineSyncCommandResultDto(
                        command.commandId(), false, 503, "Order replay is temporarily unavailable.",
                        OfflineSyncResultReason.RETRYABLE);
            }
        }
    }

    public interface CurrentUser {
        Optional<UUID> id();

        String username();

        boolean canInspectAllOfflineCommands();
    }

    public interface OrderCommands {
        void changeQuantity(UUID orderId, int quantity);
    }
}
