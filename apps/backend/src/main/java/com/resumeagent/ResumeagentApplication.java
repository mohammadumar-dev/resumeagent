package com.resumeagent;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

import com.resumeagent.config.InfisicalPropertyInitializer;

@SpringBootApplication
public class ResumeagentApplication {

	public static void main(String[] args) {
		new SpringApplicationBuilder(ResumeagentApplication.class)
			.initializers(new InfisicalPropertyInitializer())
			.run(args);
	}

}
