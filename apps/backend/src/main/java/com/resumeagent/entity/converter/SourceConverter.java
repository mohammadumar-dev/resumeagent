package com.resumeagent.entity.converter;

import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.Source;

/**
 * Source <-> DB (uppercase string: AI, USER, IMPORT).
 * Auto-applied globally.
 */
@Converter(autoApply = true)
public class SourceConverter extends AbstractUppercaseEnumConverter<Source> {
    public SourceConverter() {
        super(Source.class);
    }
}
