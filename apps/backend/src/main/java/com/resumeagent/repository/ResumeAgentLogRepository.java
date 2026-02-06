package com.resumeagent.repository;

import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.ResumeAgentLog;
import com.resumeagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeAgentLogRepository extends JpaRepository<ResumeAgentLog, UUID> {

    boolean existsByUser(User user);

    boolean existsByUserId(UUID userId);

    Optional<ResumeAgentLog> findByUser(User user);
}
