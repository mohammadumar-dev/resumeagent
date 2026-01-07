package com.resumeagent.entity.converter;

import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.UserPlan;

/**
 * UserPlan <-> DB (uppercase string: FREE, PRO).
 * Auto-applied globally.
 */
@Converter(autoApply = true)
public class UserPlanConverter extends AbstractUppercaseEnumConverter<UserPlan> {
    public UserPlanConverter() {
        super(UserPlan.class);
    }
}
