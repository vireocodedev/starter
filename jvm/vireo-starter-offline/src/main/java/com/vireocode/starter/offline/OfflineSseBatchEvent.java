package com.vireocode.starter.offline;

import java.util.List;

public record OfflineSseBatchEvent(String batchId, List<OfflineSseBatchItem> events) {
}