package com.vireocode.starter.offline;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/offline/heartbeat")
public class OfflineHeartbeatController {

    private final OfflineHeartbeatService offlineHeartbeatService;

    public OfflineHeartbeatController(OfflineHeartbeatService offlineHeartbeatService) {
        this.offlineHeartbeatService = offlineHeartbeatService;
    }

    @GetMapping
    public OfflineHeartbeatPayload getCurrent() {
        return offlineHeartbeatService.getCurrentHeartbeat();
    }

    @GetMapping("/stream")
    public SseEmitter stream(HttpServletResponse response) {
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        return offlineHeartbeatService.createEmitter();
    }
}
