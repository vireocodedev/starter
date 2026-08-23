package com.vireocode.starter.auth;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.starter.security.SecurityExpressions;
import com.vireocode.starter.web.RestUtils;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Authentication")
class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final HttpSessionSecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
    private final SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();

    AuthController(AuthenticationManager authenticationManager,
            SessionAuthenticationStrategy sessionAuthenticationStrategy) {
        this.authenticationManager = authenticationManager;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
    }

    @PostMapping("${vireo.starter.auth.login-path:/api/auth/login}")
    @PreAuthorize(SecurityExpressions.PERMIT_ALL)
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.username().trim(), request.password()));

        sessionAuthenticationStrategy.onAuthentication(authentication, httpRequest, httpResponse);

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
        securityContextRepository.saveContext(securityContext, httpRequest, httpResponse);

        return new LoginResponse(authentication.getName(), "Authenticated");
    }

    @PostMapping("${vireo.starter.auth.logout-path:/api/auth/logout}")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public AuthMessageResponse logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse,
            Authentication authentication) {
        logoutHandler.logout(httpRequest, httpResponse, authentication);

        return new AuthMessageResponse("Logged out");
    }

    @GetMapping("${vireo.starter.auth.current-user-path:/api/auth/me}")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public CurrentUserResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw RestUtils.unauthorized("Unauthorized");
        }

        String role = StarterUserDetails.resolveRole(authentication.getAuthorities());
        return new CurrentUserResponse(authentication.getName(), role);
    }
}
