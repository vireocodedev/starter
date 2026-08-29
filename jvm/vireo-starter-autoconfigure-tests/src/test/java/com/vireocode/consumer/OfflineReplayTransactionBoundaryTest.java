package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.vireocode.vireo.offline.OfflineSyncCommandDto;
import com.vireocode.vireo.offline.OfflineSyncCommandEntity;
import com.vireocode.vireo.offline.OfflineSyncCommandRepository;
import com.vireocode.vireo.offline.OfflineSyncCommandResultDto;
import com.vireocode.vireo.offline.OfflineSyncCommandStatus;
import com.vireocode.vireo.offline.OfflineSyncReplayHandler;

@SpringBootTest(classes = {
        ConsumerApplication.class,
        OfflineReplayTransactionBoundaryTest.Configuration.class
}, properties = "vireo.starter.offline.max-batch-size=10")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OfflineReplayTransactionBoundaryTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OfflineSyncCommandRepository repository;

    @Autowired
    private TestReplayHandler replayHandler;

    private final List<UUID> commandIds = new CopyOnWriteArrayList<>();

    @AfterEach
    void cleanUp() {
        repository.deleteAllById(commandIds);
        replayHandler.commands.clear();
    }

    @Test
    @WithUserDetails("demo")
    void handlerFailureDoesNotRollbackTheBatchAndRequestCredentialsNeverReachDispatch() throws Exception {
        UUID failedId = UUID.randomUUID();
        UUID appliedId = UUID.randomUUID();
        commandIds.addAll(List.of(failedId, appliedId));

        mockMvc.perform(post("/api/offline/sync")
                .with(csrf())
                .header("Host", "attacker.example")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"commands":[
                          {"commandId":"%s","method":"POST","url":"/api/test-offline/fail","body":null,
                           "headers":{"Cookie":"queued-secret","Host":"queued.example","Idempotency-Key":"safe"}},
                          {"commandId":"%s","method":"POST","url":"/api/test-offline/apply","body":null,
                           "headers":{"Cookie":"queued-secret","Idempotency-Key":"safe"}}
                        ]}
                        """.formatted(failedId, appliedId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted").value(1))
                .andExpect(jsonPath("$.failed").value(1))
                .andExpect(jsonPath("$.results[0].reason").value("RETRYABLE"))
                .andExpect(jsonPath("$.results[1].reason").value("APPLIED"));

        Map<UUID, OfflineSyncCommandEntity> stored = repository.findAllByCommandIdIn(commandIds).stream()
                .collect(java.util.stream.Collectors.toMap(OfflineSyncCommandEntity::getCommandId, entity -> entity));
        assertThat(stored.get(failedId).getStatus()).isEqualTo(OfflineSyncCommandStatus.FAILED);
        assertThat(stored.get(failedId).getResponseStatus()).isEqualTo(500);
        assertThat(stored.get(failedId).getProcessedAt()).isNotNull();
        assertThat(stored.get(appliedId).getStatus()).isEqualTo(OfflineSyncCommandStatus.DONE);
        assertThat(stored.get(appliedId).getResponseStatus()).isEqualTo(204);
        assertThat(stored.get(appliedId).getProcessedAt()).isNotNull();
        assertThat(replayHandler.commands).hasSize(2)
                .allSatisfy(command -> assertThat(command.headers())
                        .containsExactlyEntriesOf(Map.of("Idempotency-Key", "safe")));
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Configuration {

        @Bean
        TestReplayHandler testReplayHandler() {
            return new TestReplayHandler();
        }
    }

    static final class TestReplayHandler implements OfflineSyncReplayHandler {

        private final List<OfflineSyncCommandDto> commands = new CopyOnWriteArrayList<>();

        @Override
        public boolean supports(OfflineSyncCommandDto command, HttpMethod method) {
            return method == HttpMethod.POST && command.url().startsWith("/api/test-offline/");
        }

        @Override
        public OfflineSyncCommandResultDto process(OfflineSyncCommandDto command) {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive())
                    .as("application dispatch must run outside the Offline persistence transaction")
                    .isFalse();
            commands.add(command);
            if (command.url().endsWith("/fail")) {
                throw new IllegalStateException("domain conflict");
            }
            return new OfflineSyncCommandResultDto(command.commandId(), true, 204, null);
        }
    }
}
