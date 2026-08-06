package com.vireocode.starter.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class DatabaseUserDetailsService implements UserDetailsService {

    private final StarterUserRepository userRepository;

    public DatabaseUserDetailsService(StarterUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(StarterUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}