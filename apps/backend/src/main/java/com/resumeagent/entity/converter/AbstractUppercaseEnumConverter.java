package com.resumeagent.entity.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Base converter for enums persisted as uppercase DB strings using Enum.name().
 *
 * - convertToDatabaseColumn -> enum.name()
 * - convertToEntityAttribute -> case-insensitive matching of DB value to enum constant
 * - Throws IllegalArgumentException on unknown DB values (fail-fast)
 *
 * Concrete converters should call: super(YourEnum.class)
 */
@Converter
public abstract class AbstractUppercaseEnumConverter<E extends Enum<E>> implements AttributeConverter<E, String> {

    private final Class<E> enumClass;

    protected AbstractUppercaseEnumConverter(Class<E> enumClass) {
        this.enumClass = enumClass;
    }

    @Override
    public String convertToDatabaseColumn(E attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public E convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String normalized = dbData.trim().toUpperCase();
        try {
            return Enum.valueOf(enumClass, normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Unknown " + enumClass.getSimpleName() + " DB value: '" + dbData + "'", ex);
        }
    }
}
