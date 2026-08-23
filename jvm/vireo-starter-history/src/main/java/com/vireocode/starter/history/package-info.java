/**
 * Append-only history contracts and application extension points.
 *
 * <p>
 * Supported consumer APIs are the immutable {@link HistoryRecord} and
 * {@link HistoryActor} models, {@link HistoryActorResolver} and
 * {@link HistoryReadAuthorizer} extension points, and
 * {@link StarterHistoryProperties}. Persistence, recording, and controller
 * implementations deliberately remain package-private.
 */
package com.vireocode.starter.history;

import com.vireocode.starter.history.HistoryActor;
import com.vireocode.starter.history.HistoryActorResolver;
import com.vireocode.starter.history.HistoryReadAuthorizer;
import com.vireocode.starter.history.HistoryRecord;
import com.vireocode.starter.history.StarterHistoryProperties;
