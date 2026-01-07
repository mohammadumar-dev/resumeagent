package com.resumeagent.entity.converter;

import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.ExperienceBulletType;

/**
 * ExperienceBulletType <-> DB (uppercase string).
 * Auto-applied globally.
 */
@Converter(autoApply = true)
public class ExperienceBulletTypeConverter extends AbstractUppercaseEnumConverter<ExperienceBulletType> {
    public ExperienceBulletTypeConverter() {
        super(ExperienceBulletType.class);
    }
}
