package com.resumeagent.repository;

import com.resumeagent.entity.Resume;
import com.resumeagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    boolean existsByUser(User user);

    boolean existsByUserId(UUID userId);

    Optional<Resume> findByUser(User user);

    Optional<Resume> findByIdAndUserId(UUID id, UUID userId);
}
