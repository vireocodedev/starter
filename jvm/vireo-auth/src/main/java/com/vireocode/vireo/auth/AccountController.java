package com.vireocode.vireo.auth;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.vireo.security.SecurityExpressions;
import com.vireocode.vireo.web.RestUtils;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Account")
class AccountController {

    private final StarterUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    AccountController(StarterUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PutMapping("${vireo.starter.auth.change-username-path:/api/account/username}")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    @Transactional
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

    @PutMapping("${vireo.starter.auth.change-password-path:/api/account/password}")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    @Transactional
    public AuthMessageResponse changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        StarterUser user = getCurrentUser();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw RestUtils.badRequest("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new AuthMessageResponse("Password updated");
    }

    private StarterUser getCurrentUser() {
        Authentication principal = SecurityContextHolder.getContext().getAuthentication();
        if (principal == null || !principal.isAuthenticated() || principal.getName() == null
                || principal.getName().isBlank()) {
            throw RestUtils.unauthorized("Unauthorized");
        }

        return userRepository.findByUsername(principal.getName())
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
}
