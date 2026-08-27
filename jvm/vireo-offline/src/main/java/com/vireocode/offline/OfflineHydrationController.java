package com.vireocode.offline;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.security.SecurityExpressions;

@RestController
@RequestMapping("${vireo.starter.offline.hydration-endpoint-path:/api/offline/hydration}")
@Validated
public class OfflineHydrationController {

    private final OfflineEntityVersionService offlineEntityVersionService;
    private final StarterOfflineProperties properties;

    public OfflineHydrationController(OfflineEntityVersionService offlineEntityVersionService) {
        this(offlineEntityVersionService, new StarterOfflineProperties());
    }

    OfflineHydrationController(OfflineEntityVersionService offlineEntityVersionService,
            StarterOfflineProperties properties) {
        this.offlineEntityVersionService = offlineEntityVersionService;
        this.properties = properties;
    }

    @GetMapping("/versions")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public OfflineHydrationVersionsResponseDto versions(
            @RequestParam(name = "entities", required = false) List<String> entities) {
        if (entities != null && entities.size() > properties.getMaxHydrationEntities()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "At most " + properties.getMaxHydrationEntities() + " entity keys may be requested.");
        }
        return offlineEntityVersionService.getVersionSnapshot(entities);
    }
}
