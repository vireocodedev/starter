package com.vireocode.starter.offline;

final class OfflineSseBatchContextHolder {

    private static final ThreadLocal<OfflineSseBatchContext> CONTEXT = ThreadLocal
            .withInitial(OfflineSseBatchContext::new);

    private OfflineSseBatchContextHolder() {
    }

    static OfflineSseBatchContext getContext() {
        return CONTEXT.get();
    }

    static void clear() {
        OfflineSseBatchContext context = CONTEXT.get();
        context.clear();
        CONTEXT.remove();
    }
}