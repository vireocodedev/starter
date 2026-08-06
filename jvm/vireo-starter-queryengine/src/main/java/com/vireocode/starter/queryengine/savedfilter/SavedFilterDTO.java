package com.vireocode.starter.queryengine.savedfilter;

import java.util.UUID;

import com.vireocode.starter.web.OutputOnly;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedFilterDTO {

    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String entityName;

    @NotBlank
    private String engineVersion;

    @NotBlank
    private String filtersJson;

    private boolean isPublic;

    private boolean isDefault;

    @OutputOnly
    private UUID userId;

    @OutputOnly
    private String username;
}
