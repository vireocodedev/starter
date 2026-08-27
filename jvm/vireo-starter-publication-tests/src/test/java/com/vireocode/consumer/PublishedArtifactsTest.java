package com.vireocode.consumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.vireocode.auth.StarterAuthProperties;
import com.vireocode.history.HistoryRecord;
import com.vireocode.offline.OfflineSyncCommandDto;
import com.vireocode.queryengine.QueryFilterRequest;
import com.vireocode.web.ApiError;

/** Proves consumption through published JARs rather than Gradle project substitution. */
class PublishedArtifactsTest {

    @Test
    void everyVersionlessModuleResolvesFromItsPublishedJar() throws URISyntaxException {
        String version = System.getProperty("vireo.expected.version");
        Map<String, Class<?>> contracts = Map.of(
                "vireo-core", ApiError.class,
                "vireo-auth", StarterAuthProperties.class,
                "vireo-query", QueryFilterRequest.class,
                "vireo-history", HistoryRecord.class,
                "vireo-offline", OfflineSyncCommandDto.class);

        for (Map.Entry<String, Class<?>> contract : contracts.entrySet()) {
            Path artifact = Path.of(contract.getValue().getProtectionDomain()
                    .getCodeSource().getLocation().toURI());
            assertTrue(artifact.getFileName().toString().endsWith(".jar"),
                    () -> contract.getKey() + " resolved from source output instead of a published JAR: " + artifact);
            assertEquals(contract.getKey() + '-' + version + ".jar", artifact.getFileName().toString());
        }
    }
}
