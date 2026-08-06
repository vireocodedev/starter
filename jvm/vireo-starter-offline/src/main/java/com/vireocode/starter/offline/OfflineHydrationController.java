package com.vireocode.starter.offline;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.starter.security.SecurityExpressions;

@RestController
@RequestMapping("/api/offline/hydration")
@Validated
public class OfflineHydrationController {

    private final OfflineEntityVersionService offlineEntityVersionService;

    public OfflineHydrationController(OfflineEntityVersionService offlineEntityVersionService) {
        this.offlineEntityVersionService = offlineEntityVersionService;
    }

    @GetMapping("/versions")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public OfflineHydrationVersionsResponseDto versions(
            @RequestParam(name = "entities", required = false) List<String> entities) {
        return offlineEntityVersionService.getVersionSnapshot(entities);
    }
}
