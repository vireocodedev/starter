package com.vireocode.starter.auth;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.starter.security.SecurityExpressions;
import com.vireocode.starter.web.RestUtils;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/account")
@Tag(name = "Account")
public class AccountController {

    private final StarterUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountController(StarterUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PutMapping("/username")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public UsernameResponse changeUsername(@Valid @RequestBody ChangeUsernameRequest request,
            HttpServletRequest httpRequest) {
        StarterUser user = getCurrentUser();
        String newUsername = request.username().trim();

        if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw RestUtils.conflict("Username already exists");
        }

        user.setUsername(newUsername);
        userRepository.save(user);

        refreshAuthentication(user, httpRequest);

        return new UsernameResponse(newUsername);
    }

    @PutMapping("/password")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public MessageResponse changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        StarterUser user = getCurrentUser();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw RestUtils.badRequest("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new MessageResponse("Password updated");
    }

    private StarterUser getCurrentUser() {
        StarterUserDetails principal = RestUtils.getCurrentPrincipal(StarterUserDetails.class)
                .orElseThrow(() -> RestUtils.unauthorized("Unauthorized"));

        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> RestUtils.unauthorized("Unauthorized"));
    }

    private void refreshAuthentication(StarterUser user, HttpServletRequest httpRequest) {
        StarterUserDetails userDetails = new StarterUserDetails(user);
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                userDetails, null, userDetails.getAuthorities());

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
        }
    }

    public record ChangeUsernameRequest(@NotBlank String username) {
    }

    public record UsernameResponse(String username) {
    }

    public record ChangePasswordRequest(@NotBlank String currentPassword, @NotBlank String newPassword) {
    }

    public record MessageResponse(String message) {
    }
}
