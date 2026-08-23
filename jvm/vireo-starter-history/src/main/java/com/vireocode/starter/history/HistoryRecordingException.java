package com.vireocode.starter.history;

/** Raised when a history event cannot be recorded without losing information. */
public class HistoryRecordingException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public HistoryRecordingException(String message, Throwable cause) {
        super(message, cause);
    }
}
