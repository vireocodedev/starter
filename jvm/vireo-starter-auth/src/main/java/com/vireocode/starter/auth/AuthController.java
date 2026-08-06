package com.vireocode.starter.auth;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.starter.security.SecurityExpressions;
import com.vireocode.starter.web.RestUtils;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final HttpSessionSecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    @PreAuthorize(SecurityExpressions.PERMIT_ALL)
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password()));

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
        securityContextRepository.saveContext(securityContext, httpRequest, httpResponse);

        return new LoginResponse(authentication.getName(), "Authenticated");
    }

    @PostMapping("/logout")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public MessageResponse logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        return new MessageResponse("Logged out");
    }

    @GetMapping("/me")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public MeResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw RestUtils.unauthorized("Unauthorized");
        }

        String role = StarterUserDetails.resolveRole(authentication.getAuthorities());
        return new MeResponse(authentication.getName(), role);
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record LoginResponse(String username, String message) {
    }

    public record MeResponse(String username, String role) {
    }

    public record MessageResponse(String message) {
    }
}
