package com.vireocode.starter.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Repository exposed only as part of the optional default database user model. */
public interface StarterUserRepository extends JpaRepository<StarterUser, UUID> {

    Optional<StarterUser> findByUsername(String username);

    boolean existsByUsername(String username);
}
