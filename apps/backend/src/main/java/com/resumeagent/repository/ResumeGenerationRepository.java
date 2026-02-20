package com.resumeagent.repository;

import com.resumeagent.entity.ResumeGeneration;
import com.resumeagent.entity.enums.ResumeGenerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeGenerationRepository extends JpaRepository<ResumeGeneration, UUID> {
    Optional<ResumeGeneration> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
            UUID userId,
            Collection<ResumeGenerationStatus> statuses
    );
}
