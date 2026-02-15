package com.resumeagent.repository;

import com.resumeagent.entity.EmailVerificationToken;
import com.resumeagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByToken(String token);

    List<EmailVerificationToken> findByUserAndUsedFalse(User user);
}
