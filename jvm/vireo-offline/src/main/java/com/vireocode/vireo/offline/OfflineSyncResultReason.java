package com.vireocode.vireo.offline;

/**
 * Machine-readable outcome of a replayed offline command.
 *
 * <p>
 * The client uses this to decide whether a queued command may be deleted,
 * retried later, or must be surfaced to the user as permanently failed.
 * </p>
 */
public enum OfflineSyncResultReason {

    /** The command was replayed successfully during this batch. */
    APPLIED,

    /** The command had already been applied before; the result is idempotent. */
    ALREADY_APPLIED,

    /** The replay failed for a transient reason; the client should retry later. */
    RETRYABLE,

    /** The command can never succeed; the client must stop retrying it. */
    REJECTED,

    /** The server exhausted its replay budget for this command; permanent failure. */
    RETRY_LIMIT_EXCEEDED
}
