package com.resumeagent.entity.converter;

import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.UserRole;

/**
 * UserRole <-> DB (uppercase string: USER, ADMIN).
 * Auto-applied globally.
 */
@Converter(autoApply = true)
public class UserRoleConverter extends AbstractUppercaseEnumConverter<UserRole> {
    public UserRoleConverter() {
        super(UserRole.class);
    }
}
