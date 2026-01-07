package com.resumeagent.entity.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.EmploymentType;

/**
 * EmploymentType <-> DB mapping.
 *
 * DB uses hyphenated values for two constants:
 *   FULL_TIME  <-> "FULL-TIME"
 *   PART_TIME  <-> "PART-TIME"
 *
 * Behavior:
 * - convertToDatabaseColumn: maps FULL_TIME/PART_TIME to hyphen form; others -> enum.name()
 * - convertToEntityAttribute: tolerant on read (accepts "FULL-TIME", "FULL_TIME", "full time", etc.)
 * - autoApply = false: explicit @Convert recommended on the employmentType field in entities.
 */
@Converter(autoApply = false)
public class EmploymentTypeConverter implements AttributeConverter<EmploymentType, String> {

    @Override
    public String convertToDatabaseColumn(EmploymentType attribute) {
        if (attribute == null) return null;
        switch (attribute) {
            case FULL_TIME:
                return "FULL-TIME";
            case PART_TIME:
                return "PART-TIME";
            default:
                return attribute.name();
        }
    }

    @Override
    public EmploymentType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        // Normalize common variants to enum constant names:
        // - trim, uppercase, replace spaces/hyphens with underscore
        String normalized = dbData.trim().toUpperCase().replace(' ', '_').replace('-', '_');
        try {
            return EmploymentType.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown EmploymentType DB value: '" + dbData + "'", ex);
        }
    }
}
