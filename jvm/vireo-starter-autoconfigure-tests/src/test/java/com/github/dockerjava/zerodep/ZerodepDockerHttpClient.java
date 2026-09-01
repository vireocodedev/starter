package com.github.dockerjava.zerodep;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;

import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.github.dockerjava.transport.SSLConfig;

/**
 * Test-only binary compatibility bridge for Testcontainers 2.0.5.
 *
 * <p>Testcontainers still constructs the shaded zerodep transport by its old
 * class name. The shaded artifact cannot be upgraded independently and embeds
 * vulnerable Apache HTTP components, so the consumer fixture supplies the same
 * builder ABI while delegating every request to the patched non-shaded
 * transport.</p>
 */
public final class ZerodepDockerHttpClient implements DockerHttpClient {

    private final ApacheDockerHttpClient delegate;

    private ZerodepDockerHttpClient(ApacheDockerHttpClient delegate) {
        this.delegate = delegate;
    }

    @Override
    public Response execute(Request request) {
        return delegate.execute(request);
    }

    @Override
    public void close() throws IOException {
        delegate.close();
    }

    /** Mirrors the builder ABI invoked directly by Testcontainers. */
    public static final class Builder {

        private final ApacheDockerHttpClient.Builder delegate = new ApacheDockerHttpClient.Builder();

        public Builder dockerHost(URI value) {
            delegate.dockerHost(value);
            return this;
        }

        public Builder sslConfig(SSLConfig value) {
            delegate.sslConfig(value);
            return this;
        }

        public Builder maxConnections(int value) {
            delegate.maxConnections(value);
            return this;
        }

        public Builder connectionTimeout(Duration value) {
            delegate.connectionTimeout(value);
            return this;
        }

        public Builder responseTimeout(Duration value) {
            delegate.responseTimeout(value);
            return this;
        }

        public ZerodepDockerHttpClient build() {
            return new ZerodepDockerHttpClient(delegate.build());
        }
    }
}
