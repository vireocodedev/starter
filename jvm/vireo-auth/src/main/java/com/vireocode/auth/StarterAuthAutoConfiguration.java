package com.vireocode.auth;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.function.Supplier;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.flyway.StarterFlywayModule;
import com.vireocode.web.ApiError;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Wires the starter's default authentication stack from the dependency alone.
 *
 * <p>
 * This module is a default, not a mandate. The roadmap's three replacement
 * seams are all here and all work the same way — declare your own bean and the
 * library's backs off:
 *
 * <ul>
 * <li><b>user store</b> — a {@link UserDetailsService} bean replaces
 * {@link DatabaseUserDetailsService}, so a consumer on LDAP or an external IdP
 * keeps the rest of the stack;</li>
 * <li><b>security chain</b> — a {@link SecurityFilterChain} bean replaces the
 * default chain outright, and {@link StarterHttpSecurityCustomizer} covers the
 * far more common case of wanting to add one rule rather than all of them;</li>
 * <li><b>role model</b> — no role is named in code. Roles became strings in the
 * enum-opening work, and the only role this module still cares about is the one
 * guarding the API docs, which is a property.</li>
 * </ul>
 */
@AutoConfiguration
@EnableConfigurationProperties(StarterAuthProperties.class)
@SecurityScheme(name = "cookieAuth", type = SecuritySchemeType.APIKEY, in = SecuritySchemeIn.COOKIE,
        paramName = "JSESSIONID")
public class StarterAuthAutoConfiguration {

    /**
     * Migrates first of all the modules. Three other modules put foreign keys
     * into {@code app_user}, so the table has to exist before they run.
     */
    @Bean
    StarterFlywayModule authFlywayModule() {
        return new StarterFlywayModule("auth", 10);
    }

    @Bean
    @ConditionalOnMissingBean(UserDetailsService.class)
    DatabaseUserDetailsService starterUserDetailsService(StarterUserRepository userRepository) {
        return new DatabaseUserDetailsService(userRepository);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "vireo.starter.auth", name = "endpoints-enabled", matchIfMissing = true)
    AuthController starterAuthController(AuthenticationManager authenticationManager,
            SessionAuthenticationStrategy sessionAuthenticationStrategy) {
        return new AuthController(authenticationManager, sessionAuthenticationStrategy);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(name = "starterUserDetailsService")
    @ConditionalOnProperty(prefix = "vireo.starter.auth", name = {
            "endpoints-enabled", "account-endpoints-enabled" }, matchIfMissing = true)
    AccountController starterAccountController(StarterUserRepository userRepository, PasswordEncoder passwordEncoder) {
        return new AccountController(userRepository, passwordEncoder);
    }

    @Bean
    @ConditionalOnMissingBean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @ConditionalOnMissingBean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /** Applies Spring Security's session-fixation protection to manual JSON login. */
    @Bean
    @ConditionalOnMissingBean
    SessionAuthenticationStrategy starterSessionAuthenticationStrategy() {
        return new ChangeSessionIdAuthenticationStrategy();
    }

    /**
     * The default chain: session cookies, CSRF tokens a single-page application
     * can read, JSON error bodies instead of a redirect to a login form.
     *
     * <p>
     * The only rule that used to be application-specific was the role guarding
     * the API documentation, which was a hard-coded {@code SUPERADMIN}. Naming a
     * role in a library contradicts the open role model, so it is now
     * {@code vireo.starter.auth.docs-role} and defaults to requiring nothing more
     * than authentication.
     */
    @Bean
    @ConditionalOnMissingBean
    SecurityFilterChain starterSecurityFilterChain(HttpSecurity http, StarterAuthProperties properties,
            ObjectMapper objectMapper, List<StarterHttpSecurityCustomizer> customizers, Clock clock) throws Exception {

        String[] docsMatchers = properties.getDocsMatchers().toArray(String[]::new);

        // Custom rules must run before the library's final anyRequest rule.
        // Spring Security rejects request matchers registered after anyRequest.
        for (StarterHttpSecurityCustomizer customizer : customizers) {
            customizer.customize(http);
        }

        http
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(properties.getLoginPath()).permitAll();

                    // An empty matcher list is how a consumer says "the docs are
                    // not a protected resource here" — a dev profile, typically.
                    // Skipping the rule lets them fall through to the permissive
                    // catch-all below; passing an empty array to requestMatchers
                    // would throw instead.
                    if (docsMatchers.length > 0) {
                        if (StringUtils.hasText(properties.getDocsRole())) {
                            auth.requestMatchers(docsMatchers).hasRole(properties.getDocsRole());
                        } else {
                            auth.requestMatchers(docsMatchers).authenticated();
                        }
                    }

                    auth.requestMatchers(properties.getApiPathPattern()).authenticated();
                    auth.anyRequest().permitAll();
                })
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint((request, response, authException) -> writeError(objectMapper,
                                response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized", clock))
                        .accessDeniedHandler((request, response, accessDeniedException) -> writeError(objectMapper,
                                response, HttpServletResponse.SC_FORBIDDEN, "Forbidden", clock)))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .csrf(csrf -> {
                    csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                            .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                            .ignoringRequestMatchers(properties.getLoginPath(), properties.getLogoutPath());

                    if (docsMatchers.length > 0) {
                        csrf.ignoringRequestMatchers(docsMatchers);
                    }
                })
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }

    private static void writeError(ObjectMapper objectMapper, HttpServletResponse response, int status,
            String message, Clock clock) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(), new ApiError(status, message, null, Instant.now(clock)));
    }

    private static final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {

        private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
            delegate.handle(request, response, csrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            if (StringUtils.hasText(request.getHeader(csrfToken.getHeaderName()))) {
                return super.resolveCsrfTokenValue(request, csrfToken);
            }

            return delegate.resolveCsrfTokenValue(request, csrfToken);
        }
    }

    private static final class CsrfCookieFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                FilterChain filterChain) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken();
            }

            filterChain.doFilter(request, response);
        }
    }
}
