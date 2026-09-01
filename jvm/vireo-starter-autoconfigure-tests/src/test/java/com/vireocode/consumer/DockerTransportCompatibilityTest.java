package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;

import org.junit.jupiter.api.Test;
import org.testcontainers.dockerclient.DockerClientProviderStrategy;
import org.testcontainers.dockerclient.TransportConfig;

import com.github.dockerjava.api.DockerClient;

class DockerTransportCompatibilityTest {

    @Test
    void testcontainersLinksToThePatchedNonShadedTransport() throws IOException {
        TransportConfig transport = TransportConfig.builder()
                .dockerHost(URI.create("unix:///tmp/vireo-transport-contract.sock"))
                .build();

        try (DockerClient client = DockerClientProviderStrategy.getClientForConfig(transport)) {
            assertThat(client).isNotNull();
        }
    }
}
