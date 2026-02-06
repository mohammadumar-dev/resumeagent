package com.resumeagent.ai.util;

import com.knuddels.jtokkit.Encodings;
import com.knuddels.jtokkit.api.Encoding;
import com.knuddels.jtokkit.api.EncodingRegistry;
import com.knuddels.jtokkit.api.EncodingType;

public final class TokenCounter {

    private static final EncodingRegistry registry =
            Encodings.newDefaultEncodingRegistry();

    // GPT-4 / GPT-4o / OpenRouter compatible
    private static final Encoding encoding =
            registry.getEncoding(EncodingType.CL100K_BASE);

    private TokenCounter() {}

    public static int countTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        return encoding.countTokens(text);
    }
}
