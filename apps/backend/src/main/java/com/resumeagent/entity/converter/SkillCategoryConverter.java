package com.resumeagent.entity.converter;

import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.SkillCategory;

/**
 * SkillCategory <-> DB (uppercase string).
 * Auto-applied globally.
 */
@Converter(autoApply = true)
public class SkillCategoryConverter extends AbstractUppercaseEnumConverter<SkillCategory> {
    public SkillCategoryConverter() {
        super(SkillCategory.class);
    }
}
