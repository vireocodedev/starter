package com.vireocode.starter.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StarterUserRepository extends JpaRepository<StarterUser, UUID> {

    Optional<StarterUser> findByUsername(String username);

    boolean existsByUsername(String username);
}