package com.vireocode.offline;

import java.time.Instant;
import java.util.UUID;

import com.vireocode.queryengine.Filterable;
import com.vireocode.queryengine.FilterableMetadata;
import com.vireocode.queryengine.QueryOperator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sync_command")
@FilterableMetadata(title = "network.syncCommand")
@Getter
@Setter
@NoArgsConstructor
public class OfflineSyncCommandEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "command_id", nullable = false, unique = true)
    private UUID commandId;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "owner_username", nullable = false, length = 100)
    @Filterable(label = "network.owner", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
    private String ownerUsername;

    @Column(name = "http_method", nullable = false, length = 10)
    @Filterable(label = "network.httpMethod", operators = { QueryOperator.EQUALS, QueryOperator.NOT_EQUALS })
    private String httpMethod;

    @Column(name = "url", nullable = false, length = 2048)
    @Filterable(label = "network.url", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
    private String url;

    @Column(name = "request_body", columnDefinition = "text")
    private String requestBody;

    @Column(name = "request_headers", columnDefinition = "text")
    private String requestHeaders;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    @Filterable(label = "network.status", operators = { QueryOperator.EQUALS, QueryOperator.NOT_EQUALS,
            QueryOperator.IN })
    private OfflineSyncCommandStatus status;

    @Column(name = "response_status")
    @Filterable(label = "network.responseStatus")
    private Integer responseStatus;

    @Column(name = "error_message", columnDefinition = "text")
    @Filterable(label = "network.errorMessage", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
    private String errorMessage;

    /** Number of server-side replay attempts already spent on this command. */
    @Column(name = "retry_count", nullable = false)
    private int retryCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "processed_at")
    private Instant processedAt;
}
