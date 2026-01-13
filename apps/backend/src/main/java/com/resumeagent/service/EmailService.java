package com.resumeagent.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;

/**
 * EmailService
 * Responsible for sending application emails.
 * This service focuses only on email construction and delivery.
 * Responsibilities:
 * - Load and process email templates
 * - Inject dynamic values (name, links, year)
 * - Send emails using JavaMail
 * IMPORTANT:
 * - This service should NOT contain business logic
 * - It should be reusable for other email types in the future
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Sends an email verification message to the user.
     * Flow:
     * - Build verification link using the provided token
     * - Load HTML email template from classpath
     * - Replace template placeholders with dynamic values
     * - Send email as HTML using MimeMessage
     * SECURITY NOTES:
     * - Token is sent only via email link
     * - Token itself is not logged or returned
     *
     * @param recipientEmail email address of the user
     * @param recipientName  display name of the user
     * @param token          unique verification token
     *
     * @throws IOException         if email template cannot be loaded
     * @throws MessagingException  if email sending fails
     */
    public void sendVerificationEmail(
            String recipientEmail, String recipientName, String token) throws IOException, MessagingException {

        // Build verification link that user will click
        // In production, this base URL should come from configuration
        String verificationLink = "http://localhost:3000/verify-email/" + token;

        // Load HTML email template from classpath
        String htmlTemplate = loadTemplate("templates/email/email_verification.html");

        // Email subject line
        String subject = "Verification Email for ResumeAgent";

        // Replace placeholders in the HTML template
        String html = htmlTemplate
                .replace("{{recipient_name}}", recipientName)
                .replace("{{verification_link}}", verificationLink)
                .replace("{{year}}", String.valueOf(Year.now().getValue()));

        // Create MIME email message (supports HTML content)
        MimeMessage message = mailSender.createMimeMessage();
        // Helper simplifies setting recipients, subject, and body
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        helper.setFrom("ResumeAgent <yunus.bagewadi32@gmail.com>");
        helper.setTo(recipientEmail);
        helper.setSubject(subject);

        // Set email content as HTML
        helper.setText(html, true);

        // Send the email
        mailSender.send(message);
    }

    /**
     * Loads an email template file from the classpath.
     *
     * @param path relative path to the template file
     * @return template content as a String
     * @throws IOException if file cannot be read
     */
    private String loadTemplate(String path) throws IOException {

        ClassPathResource resource = new ClassPathResource(path);

        // Read template file as UTF-8 text
        byte[] bytes = resource.getInputStream().readAllBytes();

        return new String(bytes, StandardCharsets.UTF_8);
    }
}
