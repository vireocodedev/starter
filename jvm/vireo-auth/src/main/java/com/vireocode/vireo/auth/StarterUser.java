package com.vireocode.vireo.auth;

import java.util.UUID;

import com.vireocode.vireo.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Mutable JPA model for applications opting into Vireo's default user store. */
@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StarterUser extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    @NotBlank
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    @NotBlank
    private String passwordHash;

    @Column(name = "role", nullable = false, length = 50)
    @NotBlank
    private String role;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;
}
