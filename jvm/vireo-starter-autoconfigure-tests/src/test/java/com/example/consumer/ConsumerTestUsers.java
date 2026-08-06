package com.example.consumer;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vireocode.starter.auth.StarterUser;
import com.vireocode.starter.auth.StarterUserRepository;

/**
 * Seeds the two accounts the controller tests sign in as.
 *
 * <p>
 * The library ships the user table, the {@code UserDetailsService} and the
 * password encoder, but deliberately not a way to create users — who exists is
 * an application decision. This is what a consumer writes to make that
 * decision,
 * and the fact that it needs nothing but the published beans is the point.
 *
 * <p>
 * Behind {@code @Profile("test")} so the controller tests get their own
 * application context rather than sharing one with the wiring and migration
 * tests, which assert against an untouched database.
 */
@Configuration
@Profile("test")
public class ConsumerTestUsers {

    @Bean
    ApplicationRunner consumerUserSeeder(StarterUserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createIfMissing(userRepository, passwordEncoder, "demo", "demo123", "USER");
            createIfMissing(userRepository, passwordEncoder, "superadmin", "superadmin123", "SUPERADMIN");
        };
    }

    private void createIfMissing(StarterUserRepository userRepository, PasswordEncoder passwordEncoder,
            String username, String rawPassword, String role) {

        if (userRepository.existsByUsername(username)) {
            return;
        }

        StarterUser user = new StarterUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);
    }
}
