package com.vireocode.queryengine.savedfilter;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.vireocode.base.BaseMapper;
import com.vireocode.base.JsonNullableMapper;

@Mapper(uses = JsonNullableMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface SavedFilterMapper extends BaseMapper<SavedFilter, SavedFilterDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    SavedFilter toDomain(SavedFilterDTO dto);

    @Override
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    SavedFilterDTO toDto(SavedFilter domain);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void update(SavedFilterDTO update, @MappingTarget SavedFilter destination);
}
