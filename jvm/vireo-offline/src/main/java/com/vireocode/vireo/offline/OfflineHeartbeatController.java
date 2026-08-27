package com.vireocode.vireo.offline;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.security.access.prepost.PreAuthorize;

import com.vireocode.vireo.security.SecurityExpressions;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("${vireo.starter.offline.heartbeat-endpoint-path:/api/offline/heartbeat}")
public class OfflineHeartbeatController {

    private final OfflineHeartbeatService offlineHeartbeatService;

    public OfflineHeartbeatController(OfflineHeartbeatService offlineHeartbeatService) {
        this.offlineHeartbeatService = offlineHeartbeatService;
    }

    @GetMapping
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public OfflineHeartbeatPayload getCurrent() {
        return offlineHeartbeatService.getCurrentHeartbeat();
    }

    @GetMapping("/stream")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public SseEmitter stream(HttpServletResponse response) {
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        return offlineHeartbeatService.createEmitter();
    }
}
