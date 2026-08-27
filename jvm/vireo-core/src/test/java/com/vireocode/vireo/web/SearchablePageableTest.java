package com.vireocode.vireo.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

class SearchablePageableTest {

    @Test
    void hasSearchText_CoversNullBlankAndFilledValues() {
        SearchablePageable nullText = new SearchablePageable(PageRequest.of(0, 10), null);
        SearchablePageable blankText = new SearchablePageable(PageRequest.of(0, 10), "   ");
        SearchablePageable valueText = new SearchablePageable(PageRequest.of(1, 5), "query");

        assertFalse(nullText.hasSearchText());
        assertFalse(blankText.hasSearchText());
        assertTrue(valueText.hasSearchText());

        assertEquals(1, valueText.getPageable().getPageNumber());
        assertEquals("query", valueText.getSearchText());
    }

    @Test
    void rejectsMissingPageable() {
        assertThrows(NullPointerException.class, () -> new SearchablePageable(null, "query"));
    }
}
