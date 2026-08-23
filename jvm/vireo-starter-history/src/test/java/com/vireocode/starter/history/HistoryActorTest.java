package com.vireocode.starter.history;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class HistoryActorTest {

    @Test
    void normalizesOptionalIdAndLabel() {
        assertThat(new HistoryActor(" user-1 ", " Demo user "))
                .isEqualTo(new HistoryActor("user-1", "Demo user"));
        assertThat(new HistoryActor(" ", "System").id()).isNull();
    }

    @Test
    void rejectsMissingLabel() {
        assertThatThrownBy(() -> new HistoryActor(null, " "))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new HistoryActor(null, null))
                .isInstanceOf(NullPointerException.class);
    }
}
