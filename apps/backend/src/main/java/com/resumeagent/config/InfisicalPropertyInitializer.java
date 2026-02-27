package com.resumeagent.config;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.Profiles;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

public class InfisicalPropertyInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

	private static final Logger log = LoggerFactory.getLogger(InfisicalPropertyInitializer.class);
	private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(15);

	@Override
	public void initialize(ConfigurableApplicationContext applicationContext) {
		ConfigurableEnvironment env = applicationContext.getEnvironment();

		if (!isEnabled(env) || !isProd(env)) {
			return;
		}

		String baseUrl = get(env, "INFISICAL_BASE_URL", "https://app.infisical.com");
		String serviceToken = getRequired(env, "INFISICAL_SERVICE_TOKEN");
		String projectId = getRequired(env, "INFISICAL_PROJECT_ID");
		String environment = get(env, "INFISICAL_ENVIRONMENT", "prod");
		String secretPath = get(env, "INFISICAL_SECRET_PATH", "/");
		String recursive = get(env, "INFISICAL_RECURSIVE", "false");

		WebClient client = WebClient.builder().baseUrl(baseUrl).build();
		String accessToken = toServiceTokenAccess(serviceToken);
		if (!accessToken.equals(serviceToken)) {
			log.info("Using service token access segment for Infisical authentication.");
		} else {
			log.info("Using service token as-is for Infisical authentication.");
		}
		String e2eeFlag = get(env, "INFISICAL_E2EE_ENABLED", "");
		if (!"false".equalsIgnoreCase(e2eeFlag)) {
			log.warn("Service token decryption is not implemented. Ensure E2EE is disabled or secrets may be encrypted.");
		}

		Map<String, Object> secrets = fetchSecrets(client, accessToken, projectId, environment, secretPath, recursive);
		if (secrets.isEmpty()) {
			log.warn("Infisical returned 0 secrets for environment={} path={}", environment, secretPath);
			return;
		}

		env.getPropertySources().addFirst(new MapPropertySource("infisical", secrets));
		log.info("Loaded {} secrets from Infisical environment={} path={}", secrets.size(), environment, secretPath);
	}

	private static boolean isEnabled(ConfigurableEnvironment env) {
		String enabled = get(env, "INFISICAL_ENABLED", "true");
		return Boolean.parseBoolean(enabled);
	}

	private static boolean isProd(ConfigurableEnvironment env) {
		if (env.acceptsProfiles(Profiles.of("prod"))) {
			return true;
		}
		String profiles = firstNonBlank(
			System.getenv("SPRING_PROFILES_ACTIVE"),
			env.getProperty("spring.profiles.active")
		);
		if (!StringUtils.hasText(profiles)) {
			return false;
		}
		for (String profile : profiles.split(",")) {
			if ("prod".equalsIgnoreCase(profile.trim())) {
				return true;
			}
		}
		return false;
	}

	private static Map<String, Object> fetchSecrets(WebClient client, String accessToken, String projectId,
		String environment, String secretPath, String recursive) {

		InfisicalSecretsResponse response = client.get()
			.uri(uriBuilder -> uriBuilder
				.path("/api/v3/secrets/raw")
				.queryParam("workspaceId", projectId)
				.queryParam("environment", environment)
				.queryParam("secretPath", secretPath)
				.queryParam("include_imports", "true")
				.queryParam("expandSecretReferences", "true")
				.queryParam("viewSecretValue", "true")
				.queryParam("recursive", recursive)
				.build())
			.headers(headers -> headers.setBearerAuth(accessToken))
			.retrieve()
			.bodyToMono(InfisicalSecretsResponse.class)
			.block(REQUEST_TIMEOUT);

		Map<String, Object> result = new LinkedHashMap<>();
		if (response == null) {
			return result;
		}

		addSecrets(result, response.secrets());
		if (response.imports() != null) {
			for (InfisicalSecretImport secretImport : response.imports()) {
				addSecrets(result, secretImport.secrets());
			}
		}
		return result;
	}

	private static void addSecrets(Map<String, Object> target, List<InfisicalSecretItem> secrets) {
		if (secrets == null) {
			return;
		}
		for (InfisicalSecretItem secret : secrets) {
			if (secret == null) {
				continue;
			}
			String key = secret.secretKey();
			String value = secret.secretValue();
			if (StringUtils.hasText(key) && value != null) {
				target.put(key, value);
			}
		}
	}

	private static String getRequired(ConfigurableEnvironment env, String name) {
		String value = get(env, name, null);
		if (!StringUtils.hasText(value)) {
			throw new IllegalStateException("Missing required Infisical setting: " + name);
		}
		return value;
	}

	private static String get(ConfigurableEnvironment env, String name, String defaultValue) {
		String value = firstNonBlank(System.getenv(name), env.getProperty(name));
		return StringUtils.hasText(value) ? value : defaultValue;
	}

	private static String firstNonBlank(String first, String second) {
		if (StringUtils.hasText(first)) {
			return first;
		}
		return StringUtils.hasText(second) ? second : null;
	}

	record InfisicalSecretsResponse(List<InfisicalSecretItem> secrets, List<InfisicalSecretImport> imports) {
	}

	record InfisicalSecretImport(List<InfisicalSecretItem> secrets) {
	}

	record InfisicalSecretItem(String secretKey, String secretValue) {
	}

	private static String toServiceTokenAccess(String serviceToken) {
		int lastDot = serviceToken.lastIndexOf('.');
		if (lastDot <= 0) {
			return serviceToken;
		}
		return serviceToken.substring(0, lastDot);
	}
}
